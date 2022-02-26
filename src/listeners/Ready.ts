/* eslint-disable max-classes-per-file */
import type { ApplicationCommandData, ApplicationCommandManager, GuildApplicationCommandManager, GuildApplicationCommandPermissionData } from 'discord.js'
import { Events, Listener } from '@sapphire/framework'
import { ApplicationCommand } from '../lib'
import { ApplyOptions } from '@sapphire/decorators'
import type { ListenerOptions } from '@sapphire/framework'

@ApplyOptions<ListenerOptions>( {
	event: Events.ClientReady,
	name: 'ApplicationCommandsPlugin-Ready',
	once: true
} )
export class UserEvent extends Listener {
	public async run(): Promise<void> {
		this.container.applicationCommands = new Map()

		const [ applicationCommandsList, guildIds ] = this.getLists()

		const [ globalCommandList, guildCommandList ] = this.filterCommandList( applicationCommandsList )

		await this.setGlobalCommands( globalCommandList )
		await this.setAllGuildsCommands( guildCommandList, guildIds )
	}

	protected filterCommandList( commands: ApplicationCommand[] ): [ ApplicationCommand[], ApplicationCommand[] ] {
		const globalList: ApplicationCommand[] = []
		const guildList: ApplicationCommand[] = []

		for ( const command of commands ) {
			const hasGlobal = command.isChatInputApplicationGlobal || command.isMessageApplicationGlobal || command.isUserApplicationGlobal
			if ( hasGlobal ) globalList.push( command )

			const hasGuilded = command.isChatInputApplicationGuild || command.isMessageApplicationGuild || command.isUserApplicationGuild
			if ( hasGuilded ) guildList.push( command )
		}

		return [ globalList, guildList ]
	}

	protected getLists(): [ ApplicationCommand[], Set<string> ] {
		const list: ApplicationCommand[] = []
		const guilds = new Set<string>()
		const commands = this.container.stores.get( 'commands' )

		for ( const [ , command ] of commands ) {
			if ( !command.options.chatInputApplicationOptions && !command.options.messageApplicationOptions && !command.options.userApplicationOptions ) continue
			const applicationCommand = new ApplicationCommand( {
				command
			} )
			list.push( applicationCommand )
			applicationCommand.chatInputApplicationGuilds?.forEach( i => guilds.add( i ) )
			applicationCommand.messageApplicationGuilds?.forEach( i => guilds.add( i ) )
			applicationCommand.userApplicationGuilds?.forEach( i => guilds.add( i ) )
		}

		return [ list, guilds ]
	}

	protected async setAllGuildsCommands( commands: ApplicationCommand[], guilds: Set<string> ): Promise<void> {
		for ( const guild of guilds ) {
			const guildCommands = commands.filter( c => c.allGuilds?.includes( guild ) )
			await this.setGuildCommands( guildCommands, guild )
		}
	}

	protected async setCommands( manager: ApplicationCommandManager | GuildApplicationCommandManager, commands: ApplicationCommand[], scope: 'Global' | 'Guild' ): Promise<void> {
		const { applicationCommands } = this.container
		const setCommands = await manager.fetch( {} )

		const newCommands: Array<[ApplicationCommand, ApplicationCommandData]> = []
		let hasEditedCommandsFlag = false
		const types = [ 'chatInput', 'message', 'user' ] as const
		for ( const command of commands ) {
			for ( const type of types ) {
				const capitalizedType = type.charAt( 0 ).toUpperCase() + type.slice( 1 ) as Capitalize<typeof type>
				const canSet = command[ `is${ capitalizedType }Application${ scope }` ]
				if ( !canSet ) continue

				const data = command[ `${ type }ApplicationData` ]
				if ( !data ) continue

				const hints = command[ `${ type }ApplicationIdHints` ]
				const setCommand = hints
					? setCommands.find( ( _, k ) => hints.has( k ) )
					: undefined

				if ( setCommand ) {
					await manager.edit( setCommand.id, data )
					applicationCommands.set( setCommand.id, command )
					this.container.logger.debug( `Edited command with scope ${ scope } and identifier ${ setCommand.id }` )
					if ( !hasEditedCommandsFlag ) hasEditedCommandsFlag = true
				} else {
					newCommands.push( [ command, data ] )
				}
			}
		}

		if ( hasEditedCommandsFlag ) {
			for ( const [ command, commandData ] of newCommands ) {
				const created = await manager.create( commandData )
				applicationCommands.set( created.id, command )
				this.container.logger.debug( `Created command with scope ${ scope } and identifier ${ created.id }` )
			}
		} else {
			const setCommands = await manager.set( newCommands.map( i => i[ 1 ] ) )
			for ( const [ command, commandData ] of newCommands ) {
				const setCommand = setCommands.find( c => c.name === commandData.name )
				if ( !setCommand ) continue
				applicationCommands.set( setCommand.id, command )
			}
			this.container.logger.debug( `Set all commands with scope ${ scope }` )
		}
	}

	protected async setGlobalCommands( commands: ApplicationCommand[] ): Promise<void> {
		const manager = this.container.client.application?.commands
		if ( !manager ) return
		await this.setCommands( manager, commands, 'Global' )
	}

	protected async setGuildCommands( commands: ApplicationCommand[], guildId: string ): Promise<void> {
		const guild = await this.container.client.guilds.fetch( guildId )
			.catch( () => null )
		const manager = guild?.commands
		if ( !manager ) return
		await this.setCommands( manager, commands, 'Guild' )

		const setCommands = await manager.fetch()
		const fullPermissions: GuildApplicationCommandPermissionData[] = []
		for ( const [ id, setCommand ] of setCommands ) {
			let type: 'chatInput' | 'message' | 'user'
			if ( setCommand.type === 'CHAT_INPUT' ) {
				type = 'chatInput'
			} else if ( setCommand.type === 'MESSAGE' ) {
				type = 'message'
			} else {
				type = 'user'
			}

			const command = commands.find( c => c[ `${ type }ApplicationData` ]?.name === setCommand.name )
			if ( !command ) continue
			const permissions = command[ `${ type }ApplicationPermissions` ]
			if ( !permissions ) continue
			fullPermissions.push( {
				id,
				permissions
			} )
		}

		await manager.permissions.set( { fullPermissions } )
	}
}

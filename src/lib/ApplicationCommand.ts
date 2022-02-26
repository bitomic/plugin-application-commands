import type { ApplicationCommandData, ApplicationCommandPermissionData, ChatInputApplicationCommandData, MessageApplicationCommandData, UserApplicationCommandData } from 'discord.js'
import type { Command } from '@sapphire/framework'

const types = [ 'chatInput', 'message', 'user' ] as const

export class ApplicationCommand {
	public command: Command

	public chatInputApplicationIdHints: Set<string> | null = null
	public messageApplicationIdHints: Set<string> | null = null
	public userApplicationIdHints: Set<string> | null = null

	public constructor( options: ApplicationCommandOptions ) {
		this.command = options.command

		for ( const type of types ) {
			const idHints = this.command.options[ `${ type }ApplicationOptions` ]?.idHints
			if ( idHints && idHints.length > 0 ) {
				const set = new Set<string>()
				idHints.forEach( id => set.add( id ) )
				this[ `${ type }ApplicationIdHints` ] = set
			}
		}
	}

	public get allGuilds(): string[] | null {
		const chatInputHints = this.chatInputApplicationGuilds
		const messageHints = this.messageApplicationGuilds
		const userHints = this.userApplicationGuilds
		if ( !chatInputHints && !messageHints && !userHints ) return null
		return new Array<string>(
			...( chatInputHints ?? [] ), // eslint-disable-line no-extra-parens
			...( messageHints ?? [] ), // eslint-disable-line no-extra-parens
			...( userHints ?? [] ) // eslint-disable-line no-extra-parens
		)
	}

	public get allIdHints(): string[] | null {
		const chatInputHints = this.chatInputApplicationIdHints
		const messageHints = this.messageApplicationIdHints
		const userHints = this.userApplicationIdHints
		if ( !chatInputHints && !messageHints && !userHints ) return null
		return new Array<string>(
			...( chatInputHints ?? [] ), // eslint-disable-line no-extra-parens
			...( messageHints ?? [] ), // eslint-disable-line no-extra-parens
			...( userHints ?? [] ) // eslint-disable-line no-extra-parens
		)
	}

	public get chatInputApplicationGuilds(): string[] | null {
		const guilds = this.command.options.chatInputApplicationOptions?.guildIds
		if ( guilds && guilds.length > 0 ) return guilds
		return null
	}

	public get messageApplicationGuilds(): string[] | null {
		const guilds = this.command.options.messageApplicationOptions?.guildIds
		if ( guilds && guilds.length > 0 ) return guilds
		return null
	}

	public get userApplicationGuilds(): string[] | null {
		const guilds = this.command.options.userApplicationOptions?.guildIds
		if ( guilds && guilds.length > 0 ) return guilds
		return null
	}

	public get chatInputApplicationData(): ChatInputApplicationCommandData | null {
		const options = this.command.options.chatInputApplicationOptions
		if ( !options ) return null
		return {
			defaultPermission: options.defaultPermission ?? true,
			description: options.description,
			name: options.name,
			options: options.options ?? [],
			type: 'CHAT_INPUT'
		}
	}

	public get messageApplicationData(): MessageApplicationCommandData | null {
		const options = this.command.options.messageApplicationOptions
		if ( !options ) return null
		return {
			defaultPermission: options.defaultPermission ?? true,
			name: options.name,
			type: 'MESSAGE'
		}
	}

	public get userApplicationData(): UserApplicationCommandData | null {
		const options = this.command.options.userApplicationOptions
		if ( !options ) return null
		return {
			defaultPermission: options.defaultPermission ?? true,
			name: options.name,
			type: 'USER'
		}
	}

	public get chatInputApplicationPermissions(): ApplicationCommandPermissionData[] | null {
		const permissions = this.command.options.chatInputApplicationOptions?.permissions
		if ( permissions && permissions.length > 0 ) return permissions
		return null
	}

	public get messageApplicationPermissions(): ApplicationCommandPermissionData[] | null {
		const permissions = this.command.options.messageApplicationOptions?.permissions
		if ( permissions && permissions.length > 0 ) return permissions
		return null
	}

	public get userApplicationPermissions(): ApplicationCommandPermissionData[] | null {
		const permissions = this.command.options.userApplicationOptions?.permissions
		if ( permissions && permissions.length > 0 ) return permissions
		return null
	}

	public get hasChatInputApplicationGuilds(): boolean {
		return this.chatInputApplicationGuilds ? true : false
	}

	public get hasChatInputPermissions(): boolean {
		return this.chatInputApplicationPermissions ? true : false
	}

	public get hasChatInputApplicationOptions(): boolean {
		return this.command.options.chatInputApplicationOptions ? true : false
	}

	public get hasMessageApplicationGuilds(): boolean {
		return this.messageApplicationGuilds ? true : false
	}

	public get hasMessageApplicationOptions(): boolean {
		return this.command.options.messageApplicationOptions ? true : false
	}

	public get hasMessageApplicationPermissions(): boolean {
		return this.messageApplicationPermissions ? true : false
	}

	public get hasUserApplicationGuilds(): boolean {
		return this.userApplicationGuilds ? true : false
	}

	public get hasUserApplicationOptions(): boolean {
		return this.command.options.userApplicationOptions ? true : false
	}

	public get hasUserApplicationPermissions(): boolean {
		return this.userApplicationPermissions ? true : false
	}

	public get isChatInputApplicationGlobal(): boolean {
		return this.hasChatInputApplicationOptions && !this.hasChatInputApplicationGuilds
	}

	public get isChatInputApplicationGuild(): boolean {
		return this.hasChatInputApplicationOptions && this.hasChatInputApplicationGuilds
	}

	public get isMessageApplicationGlobal(): boolean {
		return this.hasMessageApplicationOptions && !this.hasMessageApplicationGuilds
	}

	public get isMessageApplicationGuild(): boolean {
		return this.hasMessageApplicationOptions && this.hasMessageApplicationGuilds
	}

	public get isUserApplicationGlobal(): boolean {
		return this.hasUserApplicationOptions && !this.hasUserApplicationGuilds
	}

	public get isUserApplicationGuild(): boolean {
		return this.hasUserApplicationOptions && this.hasUserApplicationGuilds
	}

	public getGlobalOptions(): ApplicationCommandData[] | null {
		const data: ApplicationCommandData[] = []

		for ( const type of types ) {
			if ( !this[ `${ type }ApplicationGuilds` ] ) {
				const command = this[ `${ type }ApplicationData` ]
				if ( command ) data.push( command )
			}
		}

		return data.length === 0 ? null : data
	}

	public getGuildOptions( guild: string ): ApplicationCommandData[] | null {
		const data: ApplicationCommandData[] = []

		for ( const type of types ) {
			const guilds = this[ `${ type }ApplicationGuilds` ]
			if ( !guilds?.includes( guild ) ) continue
			const command = this[ `${ type }ApplicationData` ]
			if ( command ) data.push( command )
		}

		return data.length === 0 ? null : data
	}
}

export interface ApplicationCommandOptions {
	command: Command
}

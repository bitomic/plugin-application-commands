import { ApplyOptions } from '@sapphire/decorators'
import { Constants } from 'discord.js'
import { Events } from '../lib'
import type { Interaction } from 'discord.js'
import { Listener } from '@sapphire/framework'
import type { ListenerOptions } from '@sapphire/framework'

interface TypeEvents {
	error: Events
	finished: Events
	missingCommand: Events
	missingHandler: Events
	preRun: Events
	success: Events
}

@ApplyOptions<ListenerOptions>( {
	event: Constants.Events.INTERACTION_CREATE,
	name: 'ApplicationCommandsPlugin-InteractionCreate'
} )
export class UserEvent extends Listener {
	public async run( interaction: Interaction ): Promise<void> {
		let type: 'chatInput' | 'message' | 'user'

		if ( interaction.isCommand() ) {
			type = 'chatInput'
		} else if ( interaction.isMessageContextMenu() ) {
			type = 'message'
		} else if ( interaction.isUserContextMenu() ) {
			type = 'user'
		} else {
			return
		}

		const applicationCommand = this.container.applicationCommands.get( interaction.commandId )
		const emitter = this.container.client
		const events = this.getEventsByType( type )

		if ( !applicationCommand ) {
			emitter.emit( events.missingCommand, interaction )
			return
		}

		const payload = { applicationCommand, interaction }
		const handler = applicationCommand.command[ `${ type }ApplicationRun` ]
		if ( !handler ) {
			emitter.emit( events.missingHandler, payload )
			return
		}

		emitter.emit( events.preRun, payload )
		try {
			await handler( interaction as any ) // eslint-disable-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
			emitter.emit( events.success, payload )
		} catch {
			emitter.emit( events.error, payload )
		} finally {
			emitter.emit( events.finished, payload )
		}
	}

	protected getEventsByType( type: 'chatInput' | 'message' | 'user' ): TypeEvents {
		if ( type === 'chatInput' ) {
			return {
				error: Events.ChatInputCommandError,
				finished: Events.ChatInputCommandFinished,
				missingCommand: Events.MissingChatInputCommand,
				missingHandler: Events.MissingChatInputCommandHandler,
				preRun: Events.PreChatInputCommandRun,
				success: Events.ChatInputCommandSuccess
			}
		} else if ( type === 'message' ) {
			return {
				error: Events.MessageCommandError,
				finished: Events.MessageCommandFinished,
				missingCommand: Events.MissingMessageCommand,
				missingHandler: Events.MissingMessageCommandHandler,
				preRun: Events.PreMessageCommandRun,
				success: Events.MessageCommandSuccess
			}
		} else {
			return {
				error: Events.UserCommandError,
				finished: Events.UserCommandFinished,
				missingCommand: Events.MissingUserCommand,
				missingHandler: Events.MissingUserCommandHandler,
				preRun: Events.PreUserCommandRun,
				success: Events.UserCommandSuccess
			}
		}
	}
}

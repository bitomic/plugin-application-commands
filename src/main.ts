import type { ApplicationCommandPermissionData, BaseApplicationCommandData, ChatInputApplicationCommandData, CommandInteraction, MessageApplicationCommandData, MessageInteraction, UserApplicationCommandData, UserContextMenuInteraction } from 'discord.js'
import type { ApplicationCommand } from './lib'
import type { Awaitable } from '@sapphire/framework'

export * from './lib'

type ApplicationCommandOptionsFilter<T extends BaseApplicationCommandData> = Omit<T, 'type' | 'name' | 'description'>
	& Partial<Pick<T, T extends ChatInputApplicationCommandData ? 'name' | 'description' : 'name'>>

interface ApplicationCommandAdditionalData {
	guildIds?: string[]
	idHints?: string[]
}

type ApplicationCommandOptions<T extends BaseApplicationCommandData> = ApplicationCommandOptionsFilter<T> & ApplicationCommandAdditionalData & {
	permissions?: ApplicationCommandPermissionData[]
}

declare module '@sapphire/framework' {
	interface SapphireClientOptions {
		/**
		 * @description For each application command, the function will be called to get its `guildIds` and/or `idHints`.
		 *
		 * @param name Name of the command piece, **not** the application command name.
		 * @param type Type of application command.
		 *
		 * @since 1.1.0
		 */
		applicationCommandsHintProvider?: ( name: string, type: 'chatInput' | 'message' | 'user' ) => Awaitable<ApplicationCommandAdditionalData | undefined | null>
	}

	class Command {
		/**
		 * @since 1.0.0
		 */
		public chatInputApplicationRun?( interaction: CommandInteraction ): void | Promise<void>

		/**
		 * @since 1.0.0
		 */
		public messageApplicationRun?( interaction: MessageInteraction ): void | Promise<void>

		/**
		 * @since 1.0.0
		 */
		public userApplicationRun?( interaction: UserContextMenuInteraction ): void | Promise<void>
	}

	interface CommandOptions {
		/**
		 * @since 1.0.0
		 */
		chatInputApplicationOptions?: ApplicationCommandOptions<ChatInputApplicationCommandData>

		/**
		 * @since 1.0.0
		 */
		messageApplicationOptions?: ApplicationCommandOptions<MessageApplicationCommandData>

		/**
		 * @since 1.0.0
		 */
		userApplicationOptions?: ApplicationCommandOptions<UserApplicationCommandData>
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		/**
		 * @since 1.0.0
		 */
		applicationCommands: Map<string, ApplicationCommand>
	}
}

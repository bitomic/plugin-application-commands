import type { ApplicationCommandPermissionData, BaseApplicationCommandData, ChatInputApplicationCommandData, CommandInteraction, MessageApplicationCommandData, MessageInteraction, UserApplicationCommandData, UserContextMenuInteraction } from 'discord.js'
import type { ApplicationCommand } from './lib'

export * from './lib'

type NoType<T> = Omit<T, 'type'>

interface ApplicationCommandAdditionalData {
	guildIds?: string[]
	idHints?: string[]
}

type ApplicationCommandOptions<T extends BaseApplicationCommandData> = NoType<T> & ApplicationCommandAdditionalData & {
	permissions?: ApplicationCommandPermissionData[]
}

declare module '@sapphire/framework' {
	class Command {
		public chatInputApplicationRun?( interaction: CommandInteraction ): void | Promise<void>
		public messageApplicationRun?( interaction: MessageInteraction ): void | Promise<void>
		public userApplicationRun?( interaction: UserContextMenuInteraction ): void | Promise<void>
	}

	interface CommandOptions {
		chatInputApplicationOptions?: ApplicationCommandOptions<ChatInputApplicationCommandData>
		messageApplicationOptions?: ApplicationCommandOptions<MessageApplicationCommandData>
		userApplicationOptions?: ApplicationCommandOptions<UserApplicationCommandData>
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		applicationCommands: Map<string, ApplicationCommand>
	}
}

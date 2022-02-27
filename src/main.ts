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
		applicationCommandsHintProvider?: ( name: string, type: 'chatInput' | 'message' | 'user' ) => Awaitable<ApplicationCommandAdditionalData | undefined | null>
	}

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

export const enum Events {
	// Chat Input Application Commands
	ChatInputCommandError = 'chatInputCommandError',
	ChatInputCommandFinished = 'chatInputCommandFinished',
	ChatInputCommandSuccess = 'chatInputCommandSuccess',
	MissingChatInputCommand = 'missingChatInputCommand',
	MissingChatInputCommandHandler = 'missingChatInputCommandHandler',
	PreChatInputCommandRun = 'preChatInputCommandRun',

	// Message Application Commands
	MessageCommandError = 'messageCommandError',
	MessageCommandFinished = 'messageCommandFinished',
	MessageCommandSuccess = 'messageCommandSuccess',
	MissingMessageCommand = 'missingMessageCommand',
	MissingMessageCommandHandler = 'missingMessageCommandHandler',
	PreMessageCommandRun = 'preMessageCommandRun',

	// User Application Commands
	UserCommandError = 'userCommandError',
	UserCommandFinished = 'userCommandFinished',
	UserCommandSuccess = 'userCommandSuccess',
	MissingUserCommand = 'missingUserCommand',
	MissingUserCommandHandler = 'missingUserCommandHandler',
	PreUserCommandRun = 'preUserCommandRun'
}


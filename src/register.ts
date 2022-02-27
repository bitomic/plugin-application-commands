import './main'
import { container, Plugin, postInitialization, SapphireClient } from '@sapphire/framework'
import path from 'path'

export class ApplicationCommandsPlugin extends Plugin {
	public static [ postInitialization ](): void {
		container.stores.get( 'listeners' ).registerPath( path.join( __dirname, 'listeners' ) )
	}
}

SapphireClient.plugins.registerPostInitializationHook(
	ApplicationCommandsPlugin[ postInitialization ],
	'ApplicationCommands-PostInitialization'
)

import { defineConfig } from 'tsup'

export default defineConfig( {
	clean: true,
	dts: true,
	entry: [ 'src/**/*.ts', '!src/**/*.d.ts' ],
	format: [ 'esm', 'cjs' ],
	minify: true,
	skipNodeModulesBundle: true,
	sourcemap: true,
	target: 'esnext',
	tsconfig: 'tsconfig.json',
	bundle: true,
	shims: false,
	keepNames: true,
	splitting: false
} )

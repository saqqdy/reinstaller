import type { RollupOptions } from 'rollup'
import nodeResolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import alias, { type ResolverObject } from '@rollup/plugin-alias'
import filesize from 'rollup-plugin-filesize'
import { visualizer } from 'rollup-plugin-visualizer'
import shebang from 'rollup-plugin-replace-shebang'
import pkg from '../package.json' assert { type: 'json' }
import { banner, extensions, reporter } from './config'

const externals = [
	...Object.keys(pkg.dependencies || {}),
	...Object.keys(pkg.devDependencies || {})
]
const nodeResolver = nodeResolve({
	// Use the `package.json` "browser" field
	browser: false,
	extensions,
	preferBuiltins: true,
	exportConditions: ['node'],
	moduleDirectories: ['node_modules']
})

const options: RollupOptions = {
	plugins: [
		alias({
			customResolver: nodeResolver as ResolverObject,
			entries: [
				// {
				//     find: /^#lib(.+)$/,
				//     replacement: resolve(__dirname, '..', 'src', '$1.mjs')
				// }
			]
		}),
		nodeResolver,
		commonjs({
			sourceMap: false
		}),
		shebang({
			shebang: '#!/usr/bin/env node',
			skipBackslash: true // 跳过\u005c 反斜杠
		}),
		json(),
		typescript({
			compilerOptions: {
				outDir: undefined,
				declaration: false,
				declarationDir: undefined,
				target: 'es5'
			}
		}),
		babel({
			babelHelpers: 'bundled',
			extensions,
			exclude: ['node_modules']
		}),
		visualizer(),
		filesize({ reporter })
	],
	external(id) {
		return ['core-js', 'js-cool', 'regenerator-runtime', '@babel/runtime']
			.concat(externals)
			.some(k => new RegExp('^' + k).test(id))
	}
}

export default [
	{
		input: 'src/installer.ts',
		output: [
			{
				file: pkg.main,
				exports: 'auto',
				format: 'cjs',
				banner
			},
			{
				file: pkg.module,
				exports: 'auto',
				format: 'es',
				banner
			}
		],
		...options
	}
]

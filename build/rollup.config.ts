import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { RollupOptions } from 'rollup'
import glob from 'fast-glob'
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

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const externals = [...Object.keys(pkg.dependencies || {})]
const nodeResolver = nodeResolve({
	// Use the `package.json` "browser" field
	browser: false,
	extensions,
	preferBuiltins: true,
	exportConditions: ['node'],
	moduleDirectories: ['node_modules']
})

const moduleList = glob
	.sync('*.ts', {
		cwd: resolve(__dirname, '..', 'src'),
		ignore: ['__tests__', '*_bak'],
		deep: 1
		// onlyDirectories: true
	})
	.map((name: string) => join('./src', name))

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
		json(),
		babel({
			babelHelpers: 'bundled',
			extensions,
			exclude: ['node_modules/core-js']
		}),
		commonjs({
			exclude: ['core-js']
		}),
		shebang({
			shebang: '#!/usr/bin/env node',
			skipBackslash: true // 跳过\u005c 反斜杠
		}),
		typescript({
			filterRoot: join(process.cwd(), 'src'),
			compilerOptions: {
				declaration: false,
				sourceMap: true
			}
		}),
		filesize({ reporter }),
		visualizer()
	]
}

function externalCjsEsm(id: string) {
	return [
		'core-js',
		'js-cool',
		'tslib',
		'chalk',
		'commander',
		'regenerator-runtime',
		'@babel/runtime'
	]
		.concat(externals)
		.some(k => id === k || new RegExp('^' + k + sep).test(id))
}

export default [
	{
		input: moduleList,
		output: [
			{
				entryFileNames: '[name].mjs',
				dir: 'dist',
				sourcemap: true,
				preserveModules: true,
				preserveModulesRoot: 'src',
				exports: 'auto',
				format: 'es',
				banner
			}
		],
		external: externalCjsEsm,
		...options
	}
]

// import { dirname, resolve } from 'node:path'
// import { fileURLToPath } from 'node:url'
import type { RollupOptions } from 'rollup'
// import glob from 'fast-glob'
import nodeResolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
// import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import alias, { type ResolverObject } from '@rollup/plugin-alias'
import filesize from 'rollup-plugin-filesize'
import { visualizer } from 'rollup-plugin-visualizer'
import shebang from 'rollup-plugin-replace-shebang'
import pkg from '../package.json' assert { type: 'json' }
import { banner, extensions, reporter } from './config'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = dirname(__filename)
// const production = !process.env.ROLLUP_WATCH
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

// const moduleList = glob
//     .sync('*', {
//         cwd: resolve(__dirname, '..', 'src'),
//         ignore: ['__tests__'],
//         deep: 1,
//         onlyDirectories: true
//     })
//     .map(name => resolve('src', name, 'index.ts'))

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
	// {
	//     input: moduleList,
	//     output: [
	//         {
	//             entryFileNames: '[name].cjs',
	//             dir: 'lib',
	//             preserveModules: true,
	//             preserveModulesRoot: 'src',
	//             exports: 'auto',
	//             format: 'cjs',
	//             banner
	//         },
	//         {
	//             entryFileNames: '[name].mjs',
	//             dir: 'es',
	//             preserveModules: true,
	//             preserveModulesRoot: 'src',
	//             exports: 'auto',
	//             format: 'es',
	//             banner
	//         }
	//     ],
	//     ...options
	// },
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

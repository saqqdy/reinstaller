#!/usr/bin/env ts-node

import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { program } from 'commander'
import sh from 'shelljs'
import chalk from 'chalk'
// import depcheck from 'depcheck'
import preferredPM from 'preferred-pm'
import getGitRevParse from '@gitmars/core/lib/git/getGitRevParse'
import config from './utils/config'
// import { version } from '../package.json' assert { type: 'json' }
import lang from '#lib/utils/lang'

const { t } = lang
const require = createRequire(import.meta.url)
const { yellow } = chalk
const { version } = require('../package.json')

export interface ReinstallerOption {
	update?: boolean
}

if (!sh.which('npm') || !sh.which('yarn') || !sh.which('pnpm')) {
	console.info(
		t(
			'Reinstaller can only be executed in a node environment, so please install npm/yarn/pnpm first'
		)
	)
	process.exit(1)
}
program.version(
	'	\n' +
		'             _          __       ____       \n' +
		'    _______ (_)__  ___ / /____ _/ / /__ ____\n' +
		'   / __/ -_) / _ (_-</ __/ _ `/ / / -_) __/\n' +
		'  /_/  __/_/_//_/___/__/_,_/_/_/__/_/   \n' +
		'                                        \n' +
		`v${version}, powered by saqqdy\n`,
	'-v, --version',
	t('View reinstaller version number')
)

program
	.name('reinstaller')
	.usage('[path] [options]')
	.description(t('Check for outdated, incorrect, and unused dependencies.'))
	.argument(
		'[path]',
		'Where to check. Defaults to current directory. Use -g for checking global modules.'
	)
	// .option('-u, --update', t('Interactive update.'))
	// .option('-y, --update-all', t('Uninteractive update. Apply all updates without prompting.'))
	// .option('-g, --global', t('Look at global modules.'))
	// .option('-s, --skip-unused', t('Skip check for unused packages.'))
	// .option('-p, --production', t('Skip devDependencies.'))
	// .option('-d, --dev-only ', t('Look at devDependencies only (skip dependencies).'))
	// .option('-i, --ignore', t('Ignore dependencies based on succeeding glob.'))
	// .option(
	// 	'-E, --save-exact',
	// 	t('Save exact version (x.y.z) instead of caret (^x.y.z) in package.json.')
	// )
	// .option(
	// 	'--specials',
	// 	t('List of depcheck specials to include in check for unused dependencies.')
	// )
	// .option('--no-color', t('Force or disable color output.'))
	// .option('--no-emoji', t('Remove emoji support. No emoji in default in CI environments.'))
	// .option('--debug', t('Debug output. Throw in a gist when creating issues on github.'))
	.action(async (path?: string, options?: ReinstallerOption) => {
		const { root } = getGitRevParse()
		if (!path) path = root
		const customConfig = config('reinstaller')
		const pkg = require(join(path, 'package.json'))
		const { name: pm } = (await preferredPM(path)) || { name: 'npm' }
		let argv = customConfig.registry ? ['--registry', customConfig.registry] : []

		switch (pm) {
			case 'yarn':
				argv = argv.concat(['add'])
				break
			default:
				argv = argv.concat(['i'])
				break
		}

		const pkgList = genInstallName(pkg.dependencies)
		const devPkgList = genInstallName(pkg.devDependencies)

		// run install
		if (pkgList.length > 0 || devPkgList.length > 0) {
			pkgList.length &&
				spawnSync(pm, argv.concat(pkgList), {
					stdio: 'inherit'
				})
			devPkgList.length &&
				spawnSync(pm, argv.concat(devPkgList).concat(['-D']), {
					stdio: 'inherit'
				})
		} else {
			process.exit(1)
		}

		function genInstallName(dependencies: Record<string, string>) {
			const pkgList: string[] = []
			for (let packageName in dependencies) {
				const isWorkspacePkg = dependencies[packageName] === 'workspace:*'
				const isCustomize = /^npm:/.test(dependencies[packageName])
				const isExcludePkg = customConfig.exclude.includes(packageName)
				if (isCustomize) packageName += `@${dependencies[packageName]}`
				else if (packageName in customConfig.packageTags)
					packageName += `@${customConfig.packageTags[packageName]}`
				else packageName += '@latest'
				if (!isWorkspacePkg && !isExcludePkg) {
					pkgList.push(packageName)
				}
			}
			return pkgList
		}

		// const _options = {
		// 	ignoreBinPackage: false, // ignore the packages with bin entry
		// 	skipMissing: false, // skip calculation of missing dependencies
		// 	parsers: {
		// 		// the target parsers
		// 		'**/*.js': depcheck.parser.es6,
		// 		'**/*.jsx': depcheck.parser.jsx
		// 	},
		// 	// detectors: [
		// 	// 	// the target detectors
		// 	// 	depcheck.detector.requireCallExpression,
		// 	// 	depcheck.detector.importDeclaration
		// 	// ],
		// 	// specials: [
		// 	// 	// the target special parsers
		// 	// 	depcheck.special.eslint,
		// 	// 	depcheck.special.webpack
		// 	// ],
		// 	// package: {
		// 	// 	// may specify dependencies instead of parsing package.json
		// 	// 	dependencies: {
		// 	// 		lodash: '^4.17.15'
		// 	// 	},
		// 	// 	devDependencies: {
		// 	// 		eslint: '^6.6.0'
		// 	// 	},
		// 	// 	peerDependencies: {},
		// 	// 	optionalDependencies: {}
		// 	// },
		// 	// files matching these patterns will be ignored
		// 	// ignorePatterns: ['sandbox', 'dist', 'bower_components'],
		// 	ignoreDirs: [
		// 		'sandbox',
		// 		'dist',
		// 		'generated',
		// 		'.generated',
		// 		'build',
		// 		'fixtures',
		// 		'jspm_packages'
		// 	],
		// 	ignoreMatches: [
		// 		'gulp-*',
		// 		'grunt-*',
		// 		'karma-*',
		// 		'angular-*',
		// 		'babel-*',
		// 		'metalsmith-*',
		// 		'eslint-plugin-*',
		// 		'@types/*',
		// 		'grunt',
		// 		'mocha',
		// 		'ava'
		// 	]
		// 	// specials: getSpecialParsers(currentState)
		// }

		// depcheck('/Users/saqqdy/www/saqqdy/reinstaller', _options).then(unused => {
		// 	// console.log(unused.dependencies) // an array containing the unused dependencies
		// 	// console.log(unused.devDependencies) // an array containing the unused devDependencies
		// 	console.log(unused.missing) // a lookup containing the dependencies missing in `package.json` and where they are used
		// 	// console.log(unused.using) // a lookup indicating each dependency is used by which files
		// 	// console.log(unused.invalidFiles) // files that cannot access or parse
		// 	// console.log(unused.invalidDirs) // directories that cannot access
		// })
	})

// 自定义帮助
program.on('--help', function () {
	console.info(t('\nExamples'))
	console.info('  reinstaller', "# See what can be updated, what isn't being used.")
	console.info('  reinstaller ../foo', '# Check another path.')
	console.info(
		'  reinstaller -gu',
		'# Update globally installed modules by picking which ones to upgrade.'
	)
})

// 映射不存在的指令
program.on('command:*', function (types: string[], opts: string[]) {
	const cmd = ['check', 'ck']
	if (!cmd.includes(types[0])) {
		console.info(
			yellow(
				t('Reinstaller does not provide the command "reinstaller {command}"', {
					command: types[0]
				})
			)
		)
	}
})

program.parse(process.argv)

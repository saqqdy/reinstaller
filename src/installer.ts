#!/usr/bin/env ts-node

import { createRequire } from 'node:module'
import { program } from 'commander'
import chalk from 'chalk'
import { workspaceProjectsSync } from 'workspace-projects'
import { install } from './utils'

const require = createRequire(import.meta.url)
const { yellow } = chalk
const { version } = require('../package.json')

export interface ReinstallerOption {
	all?: boolean
	dryRun?: boolean
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
	'View reinstaller version number'
)

program
	.name('reinstaller')
	.usage('[path] [options]')
	.description('Check for outdated, incorrect, and unused dependencies.')
	.argument(
		'[path]',
		'Where to check. Defaults to current directory. Use -g for checking global modules.'
	)
	.option('--dry-run', 'Dry run')
	.option('-a, --all', 'run reinstall in every sub package')
	.action(async (path: string = process.cwd(), options: ReinstallerOption = {}) => {
		let projects = [path]
		if (options.all) {
			const workspaceProjects = workspaceProjectsSync()
			workspaceProjects && (projects = workspaceProjects.concat(projects))
		}
		for (const project of projects) {
			await install(project, options.dryRun)
		}
	})

// 自定义帮助
program.on('--help', function () {
	console.info('\nExamples')
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
		console.info(yellow(`Reinstaller does not provide the command "reinstaller ${types[0]}"`))
	}
})

program.parse(process.argv)

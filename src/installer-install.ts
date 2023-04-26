#!/usr/bin/env ts-node

import { program } from 'commander'
import { workspaceProjectsSync } from 'workspace-projects'
import { install } from './utils'

export interface ReinstallerInstallOption {
	all?: boolean
	dryRun?: boolean
}

/**
 * installer install
 */
program
	.name('installer install')
	.usage('<name...> [options]')
	.arguments('<name...>')
	.option('--dry-run', 'Dry run')
	.option('-a, --all', 'install the package in every sub packages')
	.description('install package for single-repo or mono-repo project')
	.action(async (name: string, options: ReinstallerInstallOption = {}) => {
		console.log(777, name, options)
		let projects = [process.cwd()]
		if (options.all) {
			const workspaceProjects = workspaceProjectsSync()
			workspaceProjects && (projects = workspaceProjects.concat(projects))
		}
		for (const project of projects) {
			await install(project, options.dryRun)
		}
	})

program.parse(process.argv)

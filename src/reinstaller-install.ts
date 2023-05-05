#!/usr/bin/env ts-node

import { program } from 'commander'
import { workspaceProjectsSync } from 'workspace-projects'
import { type ReinstallerInstallOption, installOne } from './utils'

/**
 * installer install
 */
program
	.name('installer install')
	.usage('[path] <name...> [options]')
	.argument('<name...>', 'Package names')
	.option('--dry-run', 'Dry run')
	.option('-a, --all', 'Install the package in every sub packages')
	.option('-D, --dev', 'Package will appear in your devDependencies')
	.description('Install package for single-repo or mono-repo project')
	.action(async (name: string[], options: ReinstallerInstallOption = {}) => {
		let projects = [process.cwd()]
		if (options.all) {
			const workspaceProjects = workspaceProjectsSync()
			workspaceProjects && (projects = workspaceProjects.concat(projects))
		}
		for (const project of projects) {
			await installOne(name, project, options)
		}
	})

program.parse(process.argv)

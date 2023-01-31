import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import consola from 'consola'
import { monorepoRootSync } from 'monorepo-root'
import whatPM from 'what-pm'
import { readJSONSync } from '@node-kit/extra.fs'
import { absolutePath, config } from './'

export interface PackageJSON {
	dependencies?: Record<string, string>
	devDependencies?: Record<string, string>
}

const customConfig = config('reinstaller')

/**
 * install dependencies
 *
 * @param cwd - run path
 * @param dryRun - --dry-run
 */
export async function install(cwd: string = process.cwd(), dryRun = false) {
	cwd = absolutePath(cwd)
	const monorepoRoot = monorepoRootSync()
	const isInMonorepoRoot = monorepoRoot && monorepoRoot === cwd
	const pkg = readJSONSync(resolve(cwd, 'package.json')) as PackageJSON
	const pkgList = genInstallName(pkg.dependencies || {})
	const devPkgList = genInstallName(pkg.devDependencies || {})
	const { name: pm } = (await whatPM(cwd)) || { name: 'npm' }

	let argv = customConfig.registry ? ['--registry', customConfig.registry] : []

	switch (pm) {
		case 'yarn':
			argv = argv.concat(['add'])
			break
		default:
			argv = argv.concat(['i'])
			break
	}
	// running in package root, use '-w'
	if (isInMonorepoRoot) {
		argv.push(pm === 'yarn' ? '-W' : '-w')
	}

	// run install
	if (dryRun) {
		consola.info(cwd)
		consola.info(pkgList)
		consola.info(devPkgList)
	} else if (pkgList.length > 0 || devPkgList.length > 0) {
		pkgList.length &&
			spawnSync(pm, argv.concat(pkgList), {
				cwd,
				stdio: 'inherit'
			})
		devPkgList.length &&
			spawnSync(pm, argv.concat(devPkgList).concat(['-D']), {
				cwd,
				stdio: 'inherit'
			})
	} else {
		process.exit(1)
	}
}

/**
 * generate install name
 *
 * @param dependencies - dependencies
 * @returns pkgList - packages
 */
export function genInstallName(dependencies: Record<string, string>) {
	const pkgList: string[] = []
	for (let packageName in dependencies) {
		const isWorkspacePkg = dependencies[packageName] === 'workspace:*'
		const isCustomize = /^npm:/.test(dependencies[packageName])
		const isExcludePkg = customConfig.exclude?.includes(packageName)
		if (isCustomize) packageName += `@${dependencies[packageName]}`
		else if (packageName in (customConfig.packageTags || {}))
			packageName += `@${customConfig.packageTags[packageName]}`
		else packageName += '@latest'
		if (!isWorkspacePkg && !isExcludePkg) {
			pkgList.push(packageName)
		}
	}
	return pkgList
}

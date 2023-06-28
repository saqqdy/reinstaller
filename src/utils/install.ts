import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import consola from 'consola'
import { monorepoRootSync } from 'monorepo-root'
import whatPM from 'what-pm'
import { readJSONSync } from '@node-kit/extra.fs'
import { absolutePath } from './absolutePath'
import { config } from './config'
import { type InstallOneOptions, type InstallOptions, type PackageJSON } from './types'

const customConfig = config('reinstaller')

/**
 * install dependencies
 *
 * @param cwd - run path
 * @param options - ReinstallerOption
 */
export async function install(cwd: string = process.cwd(), options: InstallOptions) {
	cwd = absolutePath(cwd)
	const monorepoRoot = monorepoRootSync()
	const isInMonorepoRoot = monorepoRoot && monorepoRoot === cwd
	const pkgJsonPath = resolve(cwd, 'package.json')
	if (!existsSync(pkgJsonPath)) return
	const pkg = readJSONSync(pkgJsonPath) as PackageJSON
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
	if (options.dryRun) {
		consola.info(cwd)
		consola.info(pkgList)
		consola.info(argv, devPkgList)
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
 * install one dependencies
 *
 * @param name - package name
 * @param cwd - run path
 * @param options - InstallOneOptions
 */
export async function installOne(
	name: string | string[],
	cwd: string = process.cwd(),
	options: InstallOneOptions
) {
	if (typeof name === 'string') name = [name]
	cwd = absolutePath(cwd)
	const monorepoRoot = monorepoRootSync()
	const isInMonorepoRoot = monorepoRoot && monorepoRoot === cwd
	const pkgList = genInstallName(name)
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
	if (options.dev) argv.push('-D')

	// run install
	if (options.dryRun) {
		consola.info(cwd)
		consola.info(argv, pkgList)
	} else if (pkgList.length > 0) {
		pkgList.length &&
			spawnSync(pm, argv.concat(pkgList), {
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
export function genInstallName(dependencies: string | string[] | Record<string, string>) {
	const pkgList: string[] = []
	if (typeof dependencies === 'string') dependencies = { [dependencies]: 'latest' }
	if (Array.isArray(dependencies)) {
		const _map: Record<string, string> = {}
		for (const name of dependencies) _map[name] = 'latest'
		dependencies = _map
	}
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

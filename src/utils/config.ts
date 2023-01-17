import { type OptionsSync, cosmiconfigSync } from 'cosmiconfig'

export interface Config extends OptionsSync {
	depcheck: Record<string, unknown>
}

function config(pkgName: string, options?: Config) {
	return cosmiconfigSync(pkgName, options).search()?.config || {}
}

export { config, config as default }

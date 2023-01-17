import { type OptionsSync, cosmiconfigSync } from 'cosmiconfig'

export interface Config extends OptionsSync {
	depcheck: Record<string, unknown>
}

export function config(pkgName: string, options?: Config) {
	return cosmiconfigSync(pkgName, options).search()?.config || {}
}

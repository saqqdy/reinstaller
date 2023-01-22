import { type OptionsSync, cosmiconfigSync } from 'cosmiconfig'

export interface Config extends OptionsSync {
	// depcheck: Record<string, unknown>
	packageTags?: Record<string, unknown>
	exclude?: string | string[]
	registry?: string
}

export function config(pkgName: string, options?: Config) {
	return cosmiconfigSync(pkgName, options).search()?.config || {}
}

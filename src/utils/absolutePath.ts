import { isAbsolute, join } from 'node:path'

export function absolutePath(path: string): string {
	return isAbsolute(path) ? path : join(process.cwd(), path)
}

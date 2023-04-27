export interface PackageJSON {
	dependencies?: Record<string, string>
	devDependencies?: Record<string, string>
}

export interface ReinstallerOption {
	all?: boolean
	dryRun?: boolean
}

export interface ReinstallerInstallOption extends ReinstallerOption {
	dev?: boolean
}

export interface InstallOptions extends ReinstallerOption {}

export interface InstallOneOptions extends ReinstallerInstallOption {}

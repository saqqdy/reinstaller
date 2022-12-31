module.exports = {
	presets: [
		[
			'@babel/env',
			{
				loose: true,
				modules: 'auto',
				useBuiltIns: 'usage',
				corejs: 3,
				targets: 'node 12.20'
				// exclude: ['es.promise', 'es.promise.finally']
			}
		],
		'@babel/typescript'
	],
	plugins: [
		[
			'@babel/plugin-proposal-decorators',
			{
				legacy: true
			}
		],
		[
			'@babel/plugin-proposal-class-properties',
			{
				loose: true
			}
		]
	]
}

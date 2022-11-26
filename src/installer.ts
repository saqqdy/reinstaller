#!/usr/bin/env ts-node

import { createRequire } from 'node:module'
import { program } from 'commander'
import sh from 'shelljs'
import chalk from 'chalk'
// import { version } from '../package.json' assert { type: 'json' }
import lang from '#lib/utils/lang'

const { t } = lang
const require = createRequire(import.meta.url)
const { yellow } = chalk
const { version } = require('../package.json')

if (!sh.which('npm') || !sh.which('yarn') || !sh.which('pnpm')) {
    console.info(
        t(
            'Reinstaller can only be executed in a node environment, so please install npm/yarn/pnpm first'
        )
    )
    process.exit(1)
}
program.version(
    '	\n' +
        '             _          __       ____       \n' +
        '    _______ (_)__  ___ / /____ _/ / /__ ____\n' +
        '   / __/ -_) / _ (_-</ __/ _ `/ / / -_) __/\n' +
        '  /_/  __/_/_//_/___/__/_,_/_/_/__/_/   \n' +
        '                                        \n' +
        `v${version}, powered by saqqdy\n`,
    '-v, --version',
    t('View reinstaller version number')
)

program
    .name('reinstaller')
    .usage('[command] options')
    .command('check', t('Initialize reinstaller configuration'))
    .alias('ck')

// 自定义帮助
program.on('--help', function () {
    console.info(t('Use Case'))
    console.info('  $ reinstaller init')
    console.info('  $ reinstaller --help')
    console.info('  $ reinstaller -h')
})

// 映射不存在的指令
program.on('command:*', function (types: string[], opts: string[]) {
    const cmd = ['check', 'ck']
    if (!cmd.includes(types[0])) {
        console.info(
            yellow(
                t(
                    'Reinstaller does not provide the command "reinstaller {command}"',
                    { command: types[0] }
                )
            )
        )
    }
})

program.parse(process.argv)

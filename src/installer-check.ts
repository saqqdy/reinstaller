#!/usr/bin/env ts-node

import { program } from 'commander'
import chalk from 'chalk'
import { createArgs } from '@gitmars/core/lib/utils/command'
import { spawnSync } from '@gitmars/core/lib/spawn'
import echo from '@gitmars/core/lib/utils/echo'
import type { GitmarsOptionOptionsType } from '../typings'
import aliasConfig from '#lib/conf/alias'
import lang from '#lib/common/local'

const { t } = lang
const { red } = chalk
const { args, options } = aliasConfig
const actions = ['init', 'remove'] as const
type Module = typeof actions[number]
interface Action {
    (): void
}

/**
 * reinstaller check
 */
program
    .name('reinstaller alias')
    .usage('<action>')
    .description(t('Install and remove shortcuts'))
if (args.length > 0) program.arguments(createArgs(args))
options.forEach((o: GitmarsOptionOptionsType) => {
    program.option(o.flags, o.description, o.defaultValue)
})
program.action((action: Module) => {
    console.log(action)
})
program.parse(process.argv)
export {}

import { osLocaleSync } from 'os-locale'
import { type LocaleContext, useLocale } from '#lib/utils/local'
import * as languages from '#lib/locales/index'

export type LanguageType = Exclude<keyof typeof languages, 'default'>

const locales: LanguageType[] = ['enUS', 'zhCN']
let locale = (process.env.REINSTALLER_LANG || osLocaleSync()).replace('-', '') as LanguageType
if (!locales.includes(locale)) locale = 'enUS'

export default useLocale(languages[locale]) as LocaleContext

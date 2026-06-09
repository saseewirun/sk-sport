// Thai-only site. `locales` is kept as a single-entry tuple so existing
// next-intl typings continue to resolve, but there is no language switching.
export const locales = ['th'] as const
export const defaultLocale = 'th'

export type Locale = (typeof locales)[number]

import { getRequestConfig } from 'next-intl/server'

import { defaultLocale } from './config'

/**
 * Thai-only, static-first i18n config.
 *
 * The public site ships in Thai as the single locale, so we intentionally do
 * NOT read `cookies()` / `headers()` here — those request-bound APIs would opt
 * every page into dynamic rendering and prevent static generation on Vercel.
 *
 * Locale is fixed to the default ('th'). Existing `useTranslations` /
 * `getTranslations` call-sites keep working unchanged; they always resolve
 * Thai messages.
 */
export default getRequestConfig(async () => {
  const locale = defaultLocale

  const namespaces = ['Layout', 'Home', 'Service'] as const
  const messages = Object.fromEntries(
    await Promise.all(
      namespaces.map(async (namespace) => [
        namespace,
        (await import(`../messages/${locale}/${namespace}.json`)).default,
      ]),
    ),
  )

  return {
    locale,
    messages,
  }
})

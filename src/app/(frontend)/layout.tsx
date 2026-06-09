import React from 'react'
import type { Metadata } from 'next'
import { Navbar, Footer } from '@/components/layout/'
import { ButtonLink } from '@/components/button'
import { prompt, sarabun } from '@/lib/fonts'
import '@/style/typography.css'
import './styles.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { defaultLocale } from '@/i18n/config'
import { CartProvider } from '@/context/cartContext'
import { QuoteCartProvider } from '@/context/quoteCartContext'
import { getFaqGlobal } from '@/data/faq'
import { FaqChatbot } from '@/components/chatbot/FaqChatbot'

export const metadata: Metadata = {
  description: 'Your equipment. Our expertise. Perfectly installed.',
  title: 'SK Sport',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const locale = defaultLocale
  // Enable static rendering for next-intl (Thai-only) — avoids opting routes
  // into dynamic rendering via the shared layout.
  setRequestLocale(locale)
  const messages = await getMessages()
  const isLocalEnv = process.env.NODE_ENV === 'development'

  const faq = await getFaqGlobal()
  const faqItems =
    faq.faqItems
      ?.filter((item) => item.question?.trim() && item.answer?.trim())
      .map((item) => ({
        question: item.question,
        answer: item.answer,
      })) ?? []

  return (
    <html lang={locale} data-theme="sksport">
      <body className={`${sarabun.variable} ${prompt.variable}`}>
        <NextIntlClientProvider messages={messages}>
          <CartProvider>
            <QuoteCartProvider>
              <Navbar />
              <main className="pt-28">{children}</main>

              <Footer />
              <FaqChatbot faqItems={faqItems} />
              {isLocalEnv && (
                <ButtonLink
                  href="/example"
                  variant="primary"
                  className="fixed right-4 bottom-4 z-50"
                  shape="circle"
                >
                  ex
                </ButtonLink>
              )}
            </QuoteCartProvider>
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

import Link from 'next/link'
import { getFaqGlobal } from '@/data/faq'
import type { Faq } from '@/payload-types'

// Static-first: prerender at build, refresh via ISR + on-demand revalidation.
export const revalidate = 3600

const DEFAULT_HERO_TITLE = 'Frequently Asked Questions'
const DEFAULT_HERO_SUBTITLE =
  'Find answers to the most common questions about our products, services, and processes.'

const DEFAULT_BOTTOM_CTA_BODY = 'Get in touch and we can help with anything not covered here.'

function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)))
}

function px(v: number | null | undefined, min: number, max: number, fallback: number): number {
  if (v == null || !Number.isFinite(v)) return fallback
  return clampInt(v, min, max)
}

function faqTypography(f: Faq) {
  return {
    heroTitle: px(f.heroTitleFontSize, 32, 96, 56),
    heroSubtitle: px(f.heroSubtitleFontSize, 14, 32, 20),
    question: px(f.questionFontSize, 14, 32, 18),
    answer: px(f.answerFontSize, 14, 24, 16),
    bottomCtaTitle: px(f.bottomCtaTitleFontSize, 20, 48, 28),
    bottomCtaBody: px(f.bottomCtaBodyFontSize, 14, 24, 16),
  }
}

export default async function FaqPage() {
  const faq = await getFaqGlobal()
  const tf = faqTypography(faq)
  const heroTitle = faq.heroTitle?.trim() || DEFAULT_HERO_TITLE
  const heroSubtitle = faq.heroSubtitle?.trim() || DEFAULT_HERO_SUBTITLE
  const faqItems =
    faq.faqItems?.filter((item) => item.question?.trim() && item.answer?.trim()) ?? []
  const bottomCtaBodyText = faq.bottomCtaBody?.trim() || DEFAULT_BOTTOM_CTA_BODY

  return (
    <main className="flex w-full flex-col items-center">
      <section className="section-bg-to-right w-full py-16 md:py-24">
        <div className="relative z-10 container mx-auto px-6">
          <h1 className="text-primary-content" style={{ fontSize: `${tf.heroTitle}px` }}>
            {heroTitle}
          </h1>
          <p
            className="text-primary-content/80 mt-3 max-w-xl"
            style={{ fontSize: `${tf.heroSubtitle}px` }}
          >
            {heroSubtitle}
          </p>
        </div>
      </section>

      <section className="w-full bg-header-bg">
        <div className="container mx-auto px-6 py-12 md:py-20 max-w-3xl">
          <div className="flex flex-col divide-y divide-base-300">
            {faqItems.map((item, index) => (
              <div key={item.id ?? index} className="py-6 first:pt-0 last:pb-0">
                <h3 className="mb-3 text-base-content" style={{ fontSize: `${tf.question}px` }}>
                  {item.question}
                </h3>
                <p className="text-subtle leading-relaxed" style={{ fontSize: `${tf.answer}px` }}>
                  {item.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-box border border-base-300 bg-primary-content px-6 py-6 shadow-sm text-center">
            <p className="text-subtle" style={{ fontSize: `${tf.bottomCtaTitle}px` }}>
              Can&apos;t find what you&apos;re looking for?
            </p>
            <p
              className="text-subtle mt-2 mb-4 whitespace-pre-line"
              style={{ fontSize: `${tf.bottomCtaBody}px` }}
            >
              {bottomCtaBodyText}
            </p>
            <Link href="/contact" className="btn btn-gradient-solid-border btn-lg btn-lg-typo px-8">
              <span className="text-primary">Contact Our Team</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

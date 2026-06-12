import { getTranslations, setRequestLocale } from 'next-intl/server'
import { defaultLocale } from '@/i18n/config'
import { ServiceHero } from '@/components/hero/serviceHero'
import { ServiceCard } from '@/components/service/'
import { getAllServices } from '@/data/service'
import { getServicesHeroGlobal } from '@/data/servicesHero'
import type { Service, ServiceMedia, HeroMedia } from '@/payload-types'

function resolveHeroImageUrl(hero: Service['hero']): string {
  if (!hero || typeof hero === 'string') return ''
  return (hero as ServiceMedia).url ?? ''
}

function resolveHeroMediaItems(
  heroMedia: (string | HeroMedia)[] | null | undefined,
): { src: string; alt: string; id: string }[] {
  if (!heroMedia?.length) return []
  return (heroMedia as HeroMedia[])
    .filter((item): item is HeroMedia => typeof item !== 'string' && !!item)
    .map((item) => ({ src: item.url ?? '', alt: item.alt ?? '', id: item.id }))
    .filter((item) => item.src)
}

const HERO_TITLE_MIN = 32
const HERO_TITLE_MAX = 96
const HERO_TITLE_DEFAULT = 56
const HERO_SUB_MIN = 14
const HERO_SUB_MAX = 32
const HERO_SUB_DEFAULT = 20
const CARD_TITLE_MIN = 18
const CARD_TITLE_MAX = 48
const CARD_TITLE_DEFAULT = 28
const CARD_BODY_MIN = 14
const CARD_BODY_MAX = 24
const CARD_BODY_DEFAULT = 16

function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)))
}

function heroTitleFontPx(v: number | null | undefined): number {
  if (v == null || !Number.isFinite(v)) return HERO_TITLE_DEFAULT
  return clampInt(v, HERO_TITLE_MIN, HERO_TITLE_MAX)
}

function heroSubtitleFontPx(v: number | null | undefined): number {
  if (v == null || !Number.isFinite(v)) return HERO_SUB_DEFAULT
  return clampInt(v, HERO_SUB_MIN, HERO_SUB_MAX)
}

function serviceCardTitleFontPx(v: number | null | undefined): number {
  if (v == null || !Number.isFinite(v)) return CARD_TITLE_DEFAULT
  return clampInt(v, CARD_TITLE_MIN, CARD_TITLE_MAX)
}

function serviceCardBodyFontPx(v: number | null | undefined): number {
  if (v == null || !Number.isFinite(v)) return CARD_BODY_DEFAULT
  return clampInt(v, CARD_BODY_MIN, CARD_BODY_MAX)
}

export default async function ServicePage() {
  setRequestLocale(defaultLocale)
  const [t, services, servicesHero] = await Promise.all([
    getTranslations('Service.Hero'),
    getAllServices(),
    getServicesHeroGlobal(),
  ])

  const heroImages = resolveHeroMediaItems(servicesHero.heroMedia)
  const heroImageSrc = heroImages.length === 0 ? '/services-hero.png' : undefined
  const heroTitleLine1 = servicesHero.heroTitle ?? t('titleLine1')
  const heroSubtitle = servicesHero.heroSubtitle ?? (
    <>
      {t('subtitle_line1')}
      <br />
      {t('subtitle_line2')}
    </>
  )

  const listingHeroTitlePx = heroTitleFontPx(servicesHero.heroTitleFontSize)
  const listingHeroSubtitlePx = heroSubtitleFontPx(servicesHero.heroSubtitleFontSize)
  const cardTitlePx = serviceCardTitleFontPx(servicesHero.serviceCardTitleFontSize)
  const cardBodyPx = serviceCardBodyFontPx(servicesHero.serviceCardBodyFontSize)

  return (
    <main className="flex w-full flex-col items-center">
      <ServiceHero
        heroImages={heroImages.length > 0 ? heroImages : undefined}
        imageSrc={heroImageSrc}
        titleLine1={heroTitleLine1}
        titleLine2={t('titleLine2')}
        subtitle={heroSubtitle}
        ctaLabel={t('cta')}
        titleFontSizePx={listingHeroTitlePx}
        subtitleFontSizePx={listingHeroSubtitlePx}
      />

      <div className="flex w-full flex-col items-center justify-center bg-header-bg">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 items-stretch">
            {services.map((service, index) => {
              const variant = index === 0 ? 'horizontal' : 'vertical'
              return (
                <div
                  key={service.id}
                  className={
                    variant === 'horizontal' ? 'md:col-span-2 h-full' : 'col-span-1 h-full'
                  }
                >
                  <ServiceCard
                    title={service.title}
                    description={service.subtitle ?? ''}
                    image={resolveHeroImageUrl(service.hero) || '/Contact Section BG Desktop.png'}
                    href={`/service/${service.slug}`}
                    variant={variant}
                    titleFontSizePx={cardTitlePx}
                    bodyFontSizePx={cardBodyPx}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}

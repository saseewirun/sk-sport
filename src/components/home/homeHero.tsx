'use client'

import React from 'react'
import { HeroCarousel } from '@/components/carousel/HeroCarousel'
import { Button } from '@/components/button'
import type { Home } from '@/payload-types'
import { useTranslations } from 'next-intl'
import { NavKey, NAV_PATHS } from '@/const/navigation'
import { useRouter } from 'next/navigation'

type HomeHeroProps = {
  media?: Home['heroMedia']
  titleFontSizePx: number
  subtitleFontSizePx: number
}

/** Home-only hero (text sizes from CMS) — ไม่แก้ shared `Hero` สำหรับหน้าอื่น */
export function HomeHero({ media, titleFontSizePx, subtitleFontSizePx }: HomeHeroProps) {
  const t = useTranslations('Home')
  const router = useRouter()

  const carouselImages = React.useMemo(() => {
    if (media && media.length > 0) {
      return media
        .map((item) => {
          if (typeof item === 'string') return null
          return {
            src: item.url || '',
            alt: item.alt,
            id: item.id,
          }
        })
        .filter((item) => item && item.src) as { src: string; alt: string; id: string }[]
    }
    return []
  }, [media])

  return (
    <section className="relative w-full overflow-hidden bg-hero text-primary-content hero-wrapper-height h-full max-h-308">
      <HeroCarousel images={carouselImages} interval={5000} />

      <div className="relative z-10 flex w-full h-full pointer-events-none bg-overlay-40 md:h-full md:w-full hero-content-max-w flex-col justify-center px-6 py-12 lg:px-24 lg:py-24 gap-9">
        <div className="max-w-xl flex flex-col pointer-events-auto gap-6">
          <h1
            className="font-heading font-semibold leading-[120%] tracking-wider text-primary-content md:leading-[100%] md:tracking-wider"
            style={{ fontSize: `${titleFontSizePx}px` }}
          >
            <span className="block text-primary-content">{t('Hero.title_part1')}</span>
            <span className="hero-title-gradient">{t('Hero.title_part2')}</span>
            <span className="block text-primary-content">{t('Hero.title_part3')}</span>
          </h1>

          <p className="text-primary-content" style={{ fontSize: `${subtitleFontSizePx}px` }}>
            {t('Hero.description')}
          </p>
        </div>
        <Button
          variant="gradient"
          onClick={() => router.push(NAV_PATHS[NavKey.CONTACT_US])}
          className="hidden md:inline-flex hero-btn-width text-primary-content cursor-pointer pointer-events-auto"
        >
          {t('Hero.contact_us')}
        </Button>
      </div>
    </section>
  )
}

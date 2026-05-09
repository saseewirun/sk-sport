'use client'

import React from 'react'
import { HeroCarousel } from '@/components/carousel/HeroCarousel'
import type { Home } from '@/payload-types'

interface ContactPageHeroProps {
  media?: Home['heroMedia']
  title?: string
  description?: React.ReactNode
  titleFontSizePx: number
  subtitleFontSizePx: number
}

export function ContactPageHero({
  media,
  title,
  description,
  titleFontSizePx,
  subtitleFontSizePx,
}: ContactPageHeroProps) {
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
    <section className="relative w-full overflow-hidden bg-hero text-primary-content hero-wrapper-height">
      <HeroCarousel images={carouselImages} interval={5000} />

      <div className="relative z-10 flex w-full h-full flex-col items-center justify-center text-center pointer-events-none px-4">
        <div className="flex flex-col items-center gap-4 pointer-events-auto">
          {title && (
            <h1
              className="pointer-events-auto font-heading font-semibold leading-tight tracking-wider text-primary-content drop-shadow-md"
              style={{ fontSize: `${titleFontSizePx}px` }}
            >
              {title}
            </h1>
          )}
          {description && (
            <div
              className="max-w-2xl text-primary-content/90 drop-shadow-sm pointer-events-auto md:max-w-2xl"
              style={{ fontSize: `${subtitleFontSizePx}px` }}
            >
              {description}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

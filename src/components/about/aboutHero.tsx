'use client'

import { HeroCarousel } from '@/components/carousel/HeroCarousel'
import { cn } from '@/utils/cn'

interface HeroImageItem {
  src: string
  alt: string
  id: string
}

interface AboutHeroProps {
  heroTitle?: string | null
  heroSubtitle?: string | null
  heroImages?: HeroImageItem[]
  titleFontSizePx?: number
  subtitleFontSizePx?: number
}

export default function AboutHero({
  heroTitle,
  heroSubtitle,
  heroImages = [],
  titleFontSizePx,
  subtitleFontSizePx,
}: AboutHeroProps) {
  return (
    <section className="about-hero-gradient relative w-full overflow-hidden hero-wrapper-height">
      {heroImages.length > 0 && <HeroCarousel images={heroImages} interval={5000} />}
      <div className="relative z-10 container mx-auto flex h-full flex-col items-center justify-center px-6 text-center">
        {heroTitle && (
          <h1
            className={cn(
              'max-w-4xl font-semibold leading-tight tracking-wide text-primary-content drop-shadow-sm',
              titleFontSizePx == null && 'text-3xl md:text-5xl lg:text-6xl',
            )}
            style={titleFontSizePx != null ? { fontSize: `${titleFontSizePx}px` } : undefined}
          >
            {heroTitle}
          </h1>
        )}
        {heroSubtitle && (
          <>
            <p
              className={cn(
                'mt-4 max-w-2xl font-medium leading-relaxed text-primary-content/90 md:mt-5',
                subtitleFontSizePx == null && 'text-sm md:text-lg',
              )}
              style={
                subtitleFontSizePx != null ? { fontSize: `${subtitleFontSizePx}px` } : undefined
              }
            >
              {heroSubtitle}
            </p>
            <div
              className="mt-5 h-0.5 w-12 shrink-0 rounded-full bg-primary-content/50 md:mt-6 md:w-14"
              aria-hidden
            />
          </>
        )}
      </div>
    </section>
  )
}

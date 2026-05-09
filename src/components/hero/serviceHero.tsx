'use client'

import React from 'react'
import Image from 'next/image'
import { HeroCarousel } from '@/components/carousel/HeroCarousel'
import { Button } from '@/components/button'
import { NavKey, NAV_PATHS } from '@/const/navigation'
import { useRouter } from 'next/navigation'

interface HeroImageItem {
  src: string
  alt: string
  id: string
}

export interface ServiceHeroProps {
  titleLine1: string
  titleLine2?: string
  subtitle?: React.ReactNode
  imageSrc?: string
  imageAlt?: string
  heroImages?: HeroImageItem[]
  ctaLabel?: string
  ctaHref?: string
  showCta?: boolean
  contentPosition?: 'center' | 'bottom'
  /** When set, both title lines use this size (px; clamp at call site). */
  titleFontSizePx?: number
  /** When set, subtitle text uses this size (px; clamp at call site). */
  subtitleFontSizePx?: number
}

export const ServiceHero: React.FC<ServiceHeroProps> = ({
  titleLine1,
  titleLine2,
  subtitle,
  imageSrc,
  imageAlt = 'Hero background',
  heroImages,
  ctaLabel = 'Contact Us',
  ctaHref = NAV_PATHS[NavKey.CONTACT_US],
  showCta = true,
  contentPosition = 'center',
  titleFontSizePx,
  subtitleFontSizePx,
}) => {
  const router = useRouter()
  const hasCarousel = heroImages && heroImages.length > 0

  return (
    <section className="relative flex w-full overflow-hidden bg-hero text-primary-content hero-wrapper-height">
      {hasCarousel ? (
        <HeroCarousel images={heroImages} interval={5000} />
      ) : imageSrc ? (
        <Image src={imageSrc} alt={imageAlt} fill className="object-cover" priority />
      ) : null}

      <div
        className={`relative z-10 flex flex-1 flex-col w-full h-full px-4 md:px-6 lg:px-24 ${
          contentPosition === 'bottom'
            ? 'justify-end pb-12 md:pb-16'
            : 'justify-center py-6 md:py-0'
        }`}
      >
        <div className="flex flex-col gap-3 md:gap-6">
          <h1
            className={
              titleFontSizePx != null
                ? 'font-heading font-medium leading-tight md:leading-tight tracking-wider text-primary-content'
                : 'text-3xl sm:text-4xl lg:text-5xl font-heading font-medium leading-tight md:leading-tight tracking-wider text-primary-content'
            }
            style={titleFontSizePx != null ? { fontSize: `${titleFontSizePx}px` } : undefined}
          >
            <span className="block">{titleLine1}</span>
            {titleLine2 && <span className="block">{titleLine2}</span>}
          </h1>

          <div className="flex flex-col gap-4 md:gap-6">
            {subtitle && (
              <p
                className={
                  subtitleFontSizePx != null
                    ? 'font-body font-normal leading-snug tracking-wider text-primary-content/90 max-w-[95%] md:max-w-xl'
                    : 'font-body text-sm md:text-base font-normal leading-snug tracking-wider text-primary-content/90 max-w-[95%] md:max-w-xl'
                }
                style={
                  subtitleFontSizePx != null ? { fontSize: `${subtitleFontSizePx}px` } : undefined
                }
              >
                {subtitle}
              </p>
            )}

            {showCta && (
              <div className="mt-2 md:mt-0 hidden md:block">
                <Button
                  variant="gradient"
                  size="md"
                  className="hero-btn-width text-primary-content"
                  onClick={() => router.push(ctaHref)}
                >
                  {ctaLabel}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

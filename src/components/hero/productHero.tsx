'use client'

import React from 'react'
import Image from 'next/image'
import { HeroCarousel } from '@/components/carousel/HeroCarousel'

interface HeroImageItem {
  src: string
  alt: string
  id: string
}

export interface ProductHeroProps {
  heroImages?: HeroImageItem[]
  heroImageUrl?: string
  eyebrow?: string
  title: string
  subtitle?: string
  titleFontSizePx?: number
  subtitleFontSizePx?: number
}

export const ProductHero: React.FC<ProductHeroProps> = ({
  heroImages,
  heroImageUrl,
  eyebrow,
  title,
  subtitle,
  titleFontSizePx,
  subtitleFontSizePx,
}) => {
  const hasCarousel = heroImages && heroImages.length > 0

  return (
    <section className="relative overflow-hidden w-full bg-hero text-primary-content hero-wrapper-height">
      {hasCarousel ? (
        <HeroCarousel images={heroImages} interval={5000} />
      ) : heroImageUrl ? (
        <Image
          src={heroImageUrl}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      ) : null}

      <div className="relative z-10 flex w-full h-full items-center">
        <div className="container mx-auto px-6 flex flex-col gap-4">
          <div>
            {eyebrow && (
              <p className="body-sm text-secondary font-semibold uppercase tracking-widest mb-2">
                {eyebrow}
              </p>
            )}
            <h1
              className="text-primary-content hero-text-stroke"
              style={{ fontSize: `${titleFontSizePx}px` }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className="body-lg text-primary-content/80 hero-text-stroke mt-3 max-w-lg"
                style={{ fontSize: `${subtitleFontSizePx}px` }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

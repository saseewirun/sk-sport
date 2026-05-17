'use client'

import React from 'react'
import Image from 'next/image'
import { HeroCarousel } from '@/components/carousel/HeroCarousel'
import { CategoryBadge } from '@/components/common'
import { cn } from '@/utils/cn'

interface HeroImageItem {
  src: string
  alt: string
  id: string
}

export interface PortfolioHeroProps {
  variant?: 'detail' | 'listing'
  imageSrc?: string
  heroImages?: HeroImageItem[]
  category?: string
  title: string
  subtitle?: string
  publishedDate?: string
  titleFontSizePx?: number
  subtitleFontSizePx?: number
}

export const PortfolioHero: React.FC<PortfolioHeroProps> = ({
  variant = 'detail',
  imageSrc,
  heroImages,
  category,
  title,
  subtitle,
  publishedDate,
  titleFontSizePx,
  subtitleFontSizePx,
}) => {
  const isListing = variant === 'listing'
  const hasCarousel = heroImages && heroImages.length > 0

  return (
    <div
      className={cn(
        'relative flex w-full flex-col overflow-hidden',
        isListing ? 'hero-wrapper-height justify-center' : 'h-100 md:h-150 justify-end',
      )}
    >
      {isListing ? (
        hasCarousel ? (
          <HeroCarousel images={heroImages} interval={5000} />
        ) : imageSrc ? (
          <Image src={imageSrc} alt={title} fill priority className="object-cover" />
        ) : null
      ) : (
        imageSrc && <Image src={imageSrc} alt={title} fill priority className="object-cover" />
      )}

      {!isListing && <div className="absolute inset-0 bg-gradient-card-left" />}

      <div
        className={cn(
          'relative z-10 w-full px-4 md:px-8 lg:px-12 flex flex-col items-start',
          isListing ? 'py-6 md:py-8' : 'pb-5 md:pb-8',
        )}
      >
        {category && <CategoryBadge text={category} className="mb-2 md:mb-6" />}

        <h2
          className={cn(
            'font-heading tracking-wide break-words leading-snug',
            isListing ? 'text-primary-content hero-text-stroke' : 'text-primary-content',
            titleFontSizePx == null &&
              (isListing
                ? 'mb-2 max-w-4xl text-3xl sm:text-4xl md:text-5xl md:mb-3'
                : 'mb-2 max-w-md text-base sm:text-lg md:mb-4 md:max-w-lg md:text-xl'),
            titleFontSizePx != null &&
              (isListing ? 'mb-2 max-w-4xl md:mb-3' : 'mb-2 max-w-md md:mb-4 md:max-w-lg'),
          )}
          style={titleFontSizePx != null ? { fontSize: `${titleFontSizePx}px` } : undefined}
        >
          {title}
        </h2>

        {subtitle && (
          <p
            className={cn(
              'max-w-2xl',
              isListing ? 'text-primary-content/90 hero-text-stroke' : 'text-primary-content/90',
              subtitleFontSizePx != null
                ? isListing
                  ? 'leading-snug md:leading-relaxed'
                  : 'body-lg mb-2 md:mb-4'
                : isListing
                  ? 'text-sm sm:text-base leading-snug md:leading-relaxed'
                  : 'body-lg mb-2 md:mb-4',
            )}
            style={subtitleFontSizePx != null ? { fontSize: `${subtitleFontSizePx}px` } : undefined}
          >
            {subtitle}
          </p>
        )}

        {publishedDate && (
          <p className="body-sm text-primary-content/70">Published: {publishedDate}</p>
        )}
      </div>
    </div>
  )
}

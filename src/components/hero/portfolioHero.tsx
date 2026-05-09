'use client'

import React from 'react'
import Image from 'next/image'
import { CategoryBadge } from '@/components/common'
import { cn } from '@/utils/cn'

export interface PortfolioHeroProps {
  /** Listing page hero: shorter on small screens, same detail behavior when omitted */
  variant?: 'detail' | 'listing'
  imageSrc?: string
  category?: string
  title: string
  subtitle?: string
  publishedDate?: string
  /** Clamped at page level (px). When set, controls main hero title only. */
  titleFontSizePx?: number
  /** Listing only (px). When set, controls hero subtitle. */
  subtitleFontSizePx?: number
}

export const PortfolioHero: React.FC<PortfolioHeroProps> = ({
  variant = 'detail',
  imageSrc,
  category,
  title,
  subtitle,
  publishedDate,
  titleFontSizePx,
  subtitleFontSizePx,
}) => {
  const isListing = variant === 'listing'

  return (
    <div
      className={cn(
        'relative flex w-full flex-col justify-end overflow-hidden',
        isListing ? 'py-16 md:py-40' : 'h-100 md:h-150',
      )}
    >
      {imageSrc && <Image src={imageSrc} alt={title} fill priority className="object-cover" />}

      <div
        className={cn(
          'absolute inset-0',
          isListing
            ? 'bg-gradient-to-t from-base-content/90 via-base-content/55 to-base-content/25'
            : 'bg-gradient-card-left',
        )}
      />

      <div className="relative z-10 w-full px-4 md:px-8 lg:px-12 pb-5 md:pb-8 flex flex-col items-start">
        {category && <CategoryBadge text={category} className="mb-2 md:mb-6" />}

        <h2
          className={cn(
            'text-primary-content font-heading tracking-wide break-words leading-snug',
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
              'text-primary-content/90 max-w-2xl',
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

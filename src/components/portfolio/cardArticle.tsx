'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/utils/cn'

export interface ArticleData {
  id: number | string
  slug?: string
  category?: string
  title: string
  subtitle?: string
  description: string
  image?: string
  newest?: boolean
}

/** Detail route resolves by CMS `slug` only; returns null if missing or whitespace. */
export function portfolioDetailHref(slug?: string | null): string | null {
  const t = typeof slug === 'string' ? slug.trim() : ''
  return t !== '' ? `/portfolio/${t}` : null
}

export interface CardArticleProps {
  data: ArticleData
  onClick?: () => void
  /** Clamped (px) from PortfolioHero; listing grid and detail “more projects”. */
  titleFontSizePx?: number
}

export const CardArticle: React.FC<CardArticleProps> = ({ data, onClick, titleFontSizePx }) => {
  const { category, title, subtitle, image } = data

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative flex aspect-card-facility max-h-facility-card w-full overflow-hidden rounded-xl bg-base-300',
        onClick
          ? 'cursor-pointer transition-transform duration-300 hover:-translate-y-0.5'
          : 'cursor-default',
      )}
    >
      {image ? (
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-base-300 text-base-content/40">
          <span className="text-sm">No Image</span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-base-content/85 via-base-content/20 to-transparent" />

      <div className="relative z-10 mt-auto flex w-full flex-col gap-1 px-4 pb-4 pt-12 md:gap-1.5 md:px-5 md:pb-5 md:pt-16">
        {category && (
          <span className="text-facility-card-category tracking-facility-card-category font-semibold uppercase text-info md:text-xs">
            {category}
          </span>
        )}

        <h3
          className={cn(
            'line-clamp-2 font-medium leading-snug text-primary-content',
            titleFontSizePx == null && 'text-base md:text-lg',
          )}
          style={titleFontSizePx != null ? { fontSize: `${titleFontSizePx}px` } : undefined}
        >
          {title}
        </h3>

        {subtitle ? (
          <p className="line-clamp-2 text-xs leading-snug text-primary-content/75 md:text-sm">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  )
}

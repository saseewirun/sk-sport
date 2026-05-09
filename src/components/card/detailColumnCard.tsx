'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/utils/cn'

export interface DetailColumnCardProps {
  sectionTitle?: string
  description: string
  images?: string[]
  tags?: string[]
  imagePresentation?: 'default' | 'certificate'
  contentTitleFontSizePx?: number
  contentBodyFontSizePx?: number
}

export const DetailColumnCard = ({
  sectionTitle,
  description,
  images = [],
  tags = [],
  imagePresentation = 'default',
  contentTitleFontSizePx,
  contentBodyFontSizePx,
}: DetailColumnCardProps) => {
  const hasImages = images.length > 0
  const isCertificate = imagePresentation === 'certificate'

  return (
    <div className="flex w-full flex-col gap-4">
      {sectionTitle && (
        <h2
          style={
            contentTitleFontSizePx != null ? { fontSize: `${contentTitleFontSizePx}px` } : undefined
          }
        >
          {sectionTitle}
        </h2>
      )}
      {hasImages && (
        <div className="w-full">
          {images.length === 1 ? (
            <div
              className={cn(
                isCertificate
                  ? 'detail-cert-single-wrap relative mx-auto aspect-a4-paper'
                  : 'relative aspect-video w-full',
              )}
            >
              <Image
                src={images[0]}
                alt={sectionTitle || 'service image'}
                fill
                className={cn(
                  'rounded-lg',
                  isCertificate
                    ? 'object-contain shadow-md ring-1 ring-base-300/30'
                    : 'object-cover',
                )}
              />
            </div>
          ) : (
            <div
              className={cn(
                'grid',
                isCertificate
                  ? 'grid-cols-1 justify-items-center gap-8 md:grid-cols-2 md:items-start md:justify-center md:gap-10'
                  : cn('gap-3', images.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'),
              )}
            >
              {images.map((src, imgIdx) => (
                <div
                  key={`${src}-${imgIdx}`}
                  className={cn(
                    isCertificate
                      ? 'detail-cert-grid-wrap relative aspect-a4-paper'
                      : 'relative aspect-ratio-4-3 w-full',
                  )}
                >
                  <Image
                    src={src}
                    alt={`${sectionTitle || 'service'} ${imgIdx + 1}`}
                    fill
                    className={cn(
                      'rounded-lg',
                      isCertificate
                        ? 'object-contain shadow-md ring-1 ring-base-300/30'
                        : 'object-cover',
                    )}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <p
          className={contentBodyFontSizePx == null ? 'body-sm' : undefined}
          style={
            contentBodyFontSizePx != null ? { fontSize: `${contentBodyFontSizePx}px` } : undefined
          }
        >
          {description}
        </p>
        {tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="badge badge-outline border-primary text-primary body-sm">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

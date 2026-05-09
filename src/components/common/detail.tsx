'use client'

import React from 'react'
import { DetailRowCard } from '@/components/card/detailRowCard'
import { DetailColumnCard } from '@/components/card/detailColumnCard'

export interface DetailProps {
  detailTitle: string
  sectionTitle?: string
  detail: string
  images?: string[]
  variant?: 'column' | 'row'
  tags?: string[]
  alignment?: 'left' | 'right'
  verticalAlign?: 'top' | 'middle'
  /** Portrait certificate-style grid (A4-like); used only where explicitly set */
  imagePresentation?: 'default' | 'certificate'
  /** Optional section/detail typography (e.g. service detail; px, clamped at call site) */
  contentTitleFontSizePx?: number
  contentBodyFontSizePx?: number
}

export const Detail = ({
  detailTitle,
  sectionTitle,
  detail,
  images = [],
  variant = 'column',
  tags = [],
  alignment = 'left',
  verticalAlign = 'top',
  imagePresentation = 'default',
  contentTitleFontSizePx,
  contentBodyFontSizePx,
}: DetailProps) => {
  const displayImages = images && images.length > 0 ? images : ['/checker.png']

  return (
    <section className="w-full">
      {detailTitle && (
        <h2
          className="mb-3 text-gradient"
          style={
            contentTitleFontSizePx != null ? { fontSize: `${contentTitleFontSizePx}px` } : undefined
          }
        >
          {detailTitle}
        </h2>
      )}

      {variant === 'row' ? (
        <DetailRowCard
          sectionTitle={sectionTitle}
          description={detail}
          images={displayImages}
          alignment={alignment}
          tags={tags}
          verticalAlign={verticalAlign}
          contentTitleFontSizePx={contentTitleFontSizePx}
          contentBodyFontSizePx={contentBodyFontSizePx}
        />
      ) : (
        <DetailColumnCard
          sectionTitle={sectionTitle}
          description={detail}
          images={displayImages}
          tags={tags}
          imagePresentation={imagePresentation}
          contentTitleFontSizePx={contentTitleFontSizePx}
          contentBodyFontSizePx={contentBodyFontSizePx}
        />
      )}
    </section>
  )
}

'use client'

import React from 'react'
import { type ArticleItem } from '@/components/card'
import { HomeAccomplishmentArticleList } from './homeAccomplishmentArticleList'
import { NavKey, NAV_PATHS } from '@/const/navigation'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

interface AccomplishmentProps {
  items: ArticleItem[]
  sectionTitleFontSizePx: number
  cardTitleFontSizePx: number
}

export const Accomplishment = ({
  items,
  sectionTitleFontSizePx,
  cardTitleFontSizePx,
}: AccomplishmentProps) => {
  const t = useTranslations('Home.Accomplishment')
  const router = useRouter()

  return (
    <div className="w-full overflow-hidden">
      <div className="mx-auto md:px-10 px-6 md:pt-16 pt-8 md:pb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-primary" style={{ fontSize: `${sectionTitleFontSizePx}px` }}>
            {t('title')}
          </h2>
          <button
            onClick={() => router.push(NAV_PATHS[NavKey.PORTFOLIO])}
            className="btn btn-gradient-solid-border btn-sm-typo w-22.5 md:w-38.5 h-7 md:h-12"
          >
            <span className="text-primary ">{t(`button`)}</span>
          </button>
        </div>
      </div>
      <div className="w-full md:px-6 px-4">
        <HomeAccomplishmentArticleList items={items} cardTitleFontSizePx={cardTitleFontSizePx} />
      </div>
    </div>
  )
}

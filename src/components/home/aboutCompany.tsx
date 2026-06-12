'use client'

import React from 'react'
import Image from 'next/image'
import { NavKey, NAV_PATHS } from '@/const/navigation'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

type AboutCompanyProps = {
  sectionTitleFontSizePx: number
  highlightTitleFontSizePx: number
  highlightBodyFontSizePx: number
  cardBodyFontSizePx: number
  buttonFontSizePx: number
}

export const AboutCompany = ({
  sectionTitleFontSizePx,
  highlightTitleFontSizePx,
  highlightBodyFontSizePx,
  cardBodyFontSizePx,
  buttonFontSizePx,
}: AboutCompanyProps) => {
  const t = useTranslations('Home.AboutCompany')
  const router = useRouter()

  return (
    <div className="w-full flex flex-col gap-8 pt-10">
      <div className="text-center space-y-2">
        <p className="text-primary" style={{ fontSize: `${cardBodyFontSizePx}px` }}>
          Professional <br /> with
        </p>
        <h2 className="text-primary" style={{ fontSize: `${sectionTitleFontSizePx}px` }}>
          Our Company
        </h2>
      </div>

      <div className="relative w-full h-80 md:h-140">
        <div className="absolute inset-0 z-0">
          <Image src="/About Company BG.png" alt="BG" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-overlay-40 z-5" />
          <div className="absolute inset-0 bg-overlay-40 z-10 md:hidden" />
          <div className="absolute inset-y-0 right-0 w-1/2 bg-overlay-40 z-10 hidden md:block" />
        </div>

        <div className="container relative z-20 mx-auto px-6 h-full flex items-center justify-end">
          <div className="w-full md:w-1/2 flex flex-col gap-6 text-primary-content md:pl-10">
            <h3 style={{ fontSize: `${highlightTitleFontSizePx}px` }}>{t(`title`)}</h3>

            <p className="indent-1" style={{ fontSize: `${highlightBodyFontSizePx}px` }}>
              {t(`detail`)}
            </p>

            <div className="pt-4 flex justify-center md:justify-end">
              <button
                onClick={() => router.push(NAV_PATHS[NavKey.ABOUT_US])}
                className="btn btn-gradient-solid-border btn-sm-typo w-27 md:w-38.5 h-7 md:h-12"
              >
                <span
                  className="text-primary-content"
                  style={{ fontSize: `${buttonFontSizePx}px` }}
                >
                  {t('button')}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

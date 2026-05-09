'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CaretLeft, CaretRight } from '@phosphor-icons/react/dist/ssr'
import { useTranslations } from 'next-intl'

export type ProductTeaser = {
  id: string
  title: string
  slug: string
  imageUrl: string
}

type OurProductsProps = {
  products: ProductTeaser[]
  sectionTitleFontSizePx: number
  cardTitleFontSizePx: number
}

export const OurProducts = ({
  products,
  sectionTitleFontSizePx,
  cardTitleFontSizePx,
}: OurProductsProps) => {
  const t = useTranslations('Home.Product')
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [resetKey, setResetKey] = React.useState(0)

  React.useEffect(() => {
    if (products.length <= 1) return
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % products.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [products.length, resetKey])

  if (products.length === 0) return null

  const canGoPrev = products.length > 1
  const canGoNext = products.length > 1

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + products.length) % products.length)
    setResetKey((k) => k + 1)
  }
  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % products.length)
    setResetKey((k) => k + 1)
  }

  const desktopCards = products.slice(activeIndex, activeIndex + 3)
  const mobileCard = products[activeIndex]
  const mobileImgUrl = mobileCard.imageUrl

  return (
    <div className="w-full flex flex-col">
      <div className="w-full h-40 bg-header-bg px-4 flex justify-center items-center">
        <h2 className="text-header" style={{ fontSize: `${sectionTitleFontSizePx}px` }}>
          {t('title')}
        </h2>
      </div>

      <div className="w-full bg-header-bg px-4 md:px-10 pb-10">
        {/* Desktop: 3 cards side by side */}
        <div className="hidden md:grid grid-cols-3 gap-4">
          {desktopCards.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="relative overflow-hidden rounded-2xl bg-base-300 h-96 group block"
            >
              {product.imageUrl && (
                <div className="absolute inset-4">
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-contain object-center transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-card-left" />
              <div
                className="absolute bottom-4 left-4 text-primary-content font-medium leading-tight"
                style={{ fontSize: `${cardTitleFontSizePx}px` }}
              >
                {product.title}
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile: 1 card */}
        <div className="md:hidden">
          <Link
            href={`/product/${mobileCard.slug}`}
            className="relative overflow-hidden rounded-2xl bg-base-300 h-64 group block"
          >
            {mobileImgUrl && (
              <Image
                src={mobileImgUrl}
                alt={mobileCard.title}
                fill
                sizes="100vw"
                className="object-contain object-center transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-card-left" />
            <div
              className="absolute bottom-4 left-4 text-primary-content font-medium leading-tight"
              style={{ fontSize: `${cardTitleFontSizePx}px` }}
            >
              {mobileCard.title}
            </div>
          </Link>
        </div>

        {/* Navigation */}
        {products.length > 1 && (
          <div className="flex justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={goPrev}
              disabled={!canGoPrev}
              aria-label="Previous product"
              className="btn btn-ghost btn-sm disabled:opacity-30 cursor-pointer"
            >
              <CaretLeft size={24} weight="bold" />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext}
              aria-label="Next product"
              className="btn btn-ghost btn-sm disabled:opacity-30 cursor-pointer"
            >
              <CaretRight size={24} weight="bold" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

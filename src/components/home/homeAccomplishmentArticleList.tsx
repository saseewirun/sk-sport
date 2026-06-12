'use client'

import React, { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import { type ArticleItem } from '@/components/card'

type HomeAccomplishmentArticleListProps = {
  items: ArticleItem[]
  cardTitleFontSizePx: number
}

const CardItem = ({
  image,
  date,
  title,
  href,
  objectPosition,
  cardTitleFontSizePx,
}: Omit<ArticleItem, 'id'> & { cardTitleFontSizePx: number }) => {
  const router = useRouter()

  return (
    <div className="group flex h-full w-full max-w-full select-none flex-col items-start text-left">
      <button
        onClick={() => router.push(href)}
        className="btn btn-link btn-link-typo relative h-48 w-full shrink-0 cursor-pointer overflow-hidden rounded-lg border-0 bg-base-300 p-0 transition-transform focus:outline-none active:scale-95 md:h-80"
        draggable={false}
      >
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          style={objectPosition ? { objectPosition } : undefined}
          draggable={false}
        />
      </button>

      <div className="flex w-full flex-col px-1">
        <span className="body-sm mb-1 text-left font-medium">{date}</span>
        <Link href={href} draggable={false} className="w-full text-left">
          <p
            className="leading-snug transition-colors group-hover:text-primary wrap-break-word line-clamp-2"
            style={{ fontSize: `${cardTitleFontSizePx}px` }}
          >
            {title}
          </p>
        </Link>
      </div>
    </div>
  )
}

export function HomeAccomplishmentArticleList({
  items,
  cardTitleFontSizePx,
}: HomeAccomplishmentArticleListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = (target: HTMLDivElement | null) => {
    if (!target) return
    const { scrollLeft, scrollWidth, clientWidth } = target
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1)
  }

  const handleScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
    checkScroll(e.currentTarget)
  }

  useEffect(() => {
    checkScroll(scrollContainerRef.current)
  }, [items])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef
      const scrollAmount = direction === 'left' ? -280 : 280
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="group/slider relative min-w-0 w-full max-w-full overflow-hidden">
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute top-35 left-0 z-20 hidden cursor-pointer text-header-bg/60 transition-all md:block"
        >
          <CaretLeftIcon size={96} strokeWidth={1.5} />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="no-scrollbar flex w-full snap-x snap-mandatory flex-row gap-5 overflow-x-auto scroll-smooth pt-2 pb-8"
      >
        {items.map((item) => (
          <div key={item.id} className="w-40 shrink-0 snap-start md:w-66.5">
            <CardItem
              image={item.image}
              date={item.date}
              title={item.title}
              href={item.href}
              objectPosition={item.objectPosition}
              cardTitleFontSizePx={cardTitleFontSizePx}
            />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-between px-2 md:hidden">
        <div className="pointer-events-auto">
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Previous accomplishment"
              className="drop-shadow-article-nav-icon cursor-pointer p-2 text-primary-content transition-opacity hover:opacity-90"
            >
              <CaretLeftIcon size={28} strokeWidth={2} />
            </button>
          )}
        </div>
        <div className="pointer-events-auto">
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Next accomplishment"
              className="drop-shadow-article-nav-icon cursor-pointer p-2 text-primary-content transition-opacity hover:opacity-90"
            >
              <CaretRightIcon size={28} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute top-35 right-0 z-20 hidden cursor-pointer text-header-bg/60 transition-all md:block"
        >
          <CaretRightIcon size={96} strokeWidth={1.5} />
        </button>
      )}
    </div>
  )
}

'use client'

import React, { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'

export interface ArticleItem {
  id: string | number
  image: string
  date: string
  title: string
  href: string
  /** ตำแหน่งโฟกัสของรูป (object-position) เพื่อกันภาพโดนตัดหัว — ไม่ระบุ = กึ่งกลาง */
  objectPosition?: string
}

interface ArticleCardProps {
  items: ArticleItem[]
}

const CardItem = ({ image, date, title, href }: Omit<ArticleItem, 'id'>) => {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-3 group h-full select-none w-full items-start text-left max-w-full">
      <button
        onClick={() => router.push(href)}
        className="btn btn-link btn-link-typo relative w-full md:h-80 h-48 overflow-hidden rounded-lg bg-base-300 p-0 border-0 focus:outline-none transition-transform active:scale-95 shrink-0"
        draggable={false}
      >
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          draggable={false}
        />
      </button>

      <div className="flex flex-col px-1 w-full">
        <span className="body-sm font-medium mb-1 text-left">{date}</span>
        <Link href={href} draggable={false} className="w-full  text-left">
          <p className="body-sm leading-snug group-hover:text-primary transition-colors wrap-break-word line-clamp-2">
            {title}
          </p>
        </Link>
      </div>
    </div>
  )
}

export const ArticleCard = ({ items }: ArticleCardProps) => {
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
    <div className="relative w-full max-w-full min-w-0 group/slider overflow-hidden">
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-35 z-20 text-header-bg/60 transition-all hidden md:block cursor-pointer"
        >
          <CaretLeftIcon size={96} strokeWidth={1.5} />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-8 pt-2 no-scrollbar w-full"
      >
        {items.map((item) => (
          <div key={item.id} className="md:w-66.5 w-40 snap-start shrink-0">
            <CardItem {...item} />
          </div>
        ))}
      </div>

      <div className="md:hidden pointer-events-none absolute inset-0 z-30 flex items-center justify-between px-2">
        <div className="pointer-events-auto">
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Previous accomplishment"
              className="drop-shadow-article-nav-icon p-2 text-primary-content transition-opacity hover:opacity-90 cursor-pointer"
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
              className="drop-shadow-article-nav-icon p-2 text-primary-content transition-opacity hover:opacity-90 cursor-pointer"
            >
              <CaretRightIcon size={28} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-35 z-20 text-header-bg/60 transition-all hidden md:block cursor-pointer"
        >
          <CaretRightIcon size={96} strokeWidth={1.5} />
        </button>
      )}
    </div>
  )
}

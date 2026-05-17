'use client'

import React from 'react'
import Image, { StaticImageData } from 'next/image'
import { useCarousel } from '@/hooks/useCarousel'
import { Button } from '../button'

interface HeroImage {
  src: string | StaticImageData
  alt: string
  id?: string
}

interface HeroCarouselProps {
  images: HeroImage[]
  activeIndex?: number
  onSlideChange?: (index: number) => void
  interval?: number
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  images,
  activeIndex,
  onSlideChange,
  interval = 5000,
}) => {
  const { currentSlide, carouselRef, scrollToSlide } = useCarousel(images.length, interval)
  const prevActiveIndexRef = React.useRef(activeIndex)

  React.useEffect(() => {
    if (typeof activeIndex === 'number' && activeIndex !== prevActiveIndexRef.current) {
      prevActiveIndexRef.current = activeIndex
      if (activeIndex !== currentSlide) {
        scrollToSlide(activeIndex)
      }
    }
  }, [activeIndex, scrollToSlide, currentSlide])

  const prevCurrentSlideRef = React.useRef(currentSlide)

  React.useEffect(() => {
    if (currentSlide !== prevCurrentSlideRef.current) {
      prevCurrentSlideRef.current = currentSlide
      onSlideChange?.(currentSlide)
    }
  }, [currentSlide, onSlideChange])

  if (!images || images.length === 0) {
    return null
  }

  return (
    <>
      <div className="absolute inset-0 z-0">
        <div
          ref={carouselRef}
          className="flex w-full h-full overflow-x-scroll snap-x snap-mandatory hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {images.map((img, index) => (
            <div
              key={`${typeof img.src === 'string' ? img.src : img.src.src}-${index}`}
              id={`slide${index + 1}`}
              className="relative w-full h-full snap-start flex-none"
            >
              <Image
                src={img.src}
                alt={img.alt || `Hero Background ${index + 1}`}
                fill
                className="object-cover object-center"
                priority={index === 0}
              />
            </div>
          ))}
          <div key="clone-first" className="relative w-full h-full snap-start flex-none">
            <Image
              src={images[0].src}
              alt={images[0].alt || 'Hero Background Clone'}
              fill
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>

      <div className="absolute md:bottom-8 bottom-4 left-1/2 flex -translate-x-1/2 gap-3 z-20">
        {images.map((img, index) => (
          <Button
            key={img.id || index}
            shape="circle"
            size="sm"
            variant="ghost"
            onClick={() => scrollToSlide(index)}
            style={{
              backgroundColor:
                currentSlide === index ? 'var(--color-dot-active)' : 'var(--color-dot-inactive)',
            }}
            className="min-h-0 h-3 w-3 p-0 border-none transition-all duration-300 ease-in-out hover:brightness-110"
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </>
  )
}

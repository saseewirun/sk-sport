'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { XIcon, CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react/dist/ssr'
import { GalleryMedia } from '@/payload-types'
import { Marquee } from '@/utils/Marquee'

interface GalleryProps {
  media?: (string | GalleryMedia)[] | null
  sectionTitleFontSizePx: number
}

type GalleryItem = { src: string; objectPosition: string }

function objectPositionFromFocal(media: {
  focalX?: number | null
  focalY?: number | null
}): string {
  return `${media.focalX ?? 50}% ${media.focalY ?? 50}%`
}

export const Gallery = ({ media, sectionTitleFontSizePx }: GalleryProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  const galleryItems: GalleryItem[] = (media || [])
    .map((item) => {
      if (typeof item === 'string') return item ? { src: item, objectPosition: '50% 50%' } : null
      return item.url ? { src: item.url, objectPosition: objectPositionFromFocal(item) } : null
    })
    .filter((item): item is GalleryItem => item !== null)
  const galleryImages = galleryItems.map((item) => item.src)

  const openModal = (index: number) => {
    setSelectedImageIndex(index)
  }

  const closeModal = () => {
    setSelectedImageIndex(null)
  }

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + galleryImages.length) % galleryImages.length)
    }
  }

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % galleryImages.length)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return

      if (e.key === 'Escape') {
        closeModal()
      } else if (e.key === 'ArrowLeft') {
        setSelectedImageIndex(
          (selectedImageIndex - 1 + galleryImages.length) % galleryImages.length,
        )
      } else if (e.key === 'ArrowRight') {
        setSelectedImageIndex((selectedImageIndex + 1) % galleryImages.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedImageIndex, galleryImages.length])

  if (galleryImages.length === 0) return null

  return (
    <section className="w-full pt-10 pb-24 overflow-hidden">
      <div className="mx-auto w-full max-w-screen-xl px-4">
        <h2 className="h2 pb-10 leading-tight" style={{ fontSize: `${sectionTitleFontSizePx}px` }}>
          <span className="text-primary">Our</span>
          <span> </span>
          <span className="text-primary">Gallery</span>
        </h2>
      </div>

      <div className="relative mt-4 h-72 w-full flex items-center overflow-hidden">
        <Marquee pauseOnHover speed={20}>
          {galleryItems.map((item, index) => (
            <div
              key={`marquee-item-${index}`}
              className="relative h-64 w-64 shrink-0 cursor-pointer overflow-hidden rounded-lg transition-transform duration-300 hover:scale-105 hover:shadow-lg"
              onClick={() => openModal(index)}
            >
              <Image
                src={item.src}
                alt={`Gallery ${index + 1}`}
                fill
                className="object-cover"
                style={{ objectPosition: item.objectPosition }}
              />
            </div>
          ))}
        </Marquee>
      </div>

      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-overlay-40 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="relative mt-12 h-[80vh] w-[90%] max-w-xl overflow-hidden rounded-2xl bg-primary-content shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 z-10 rounded-full bg-primary-content p-2 shadow-lg transition-all hover:scale-110"
              aria-label="Close"
            >
              <XIcon size={24} weight="bold" />
            </button>

            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-primary-content p-2 shadow-lg transition-all hover:scale-110"
              aria-label="Previous"
            >
              <CaretLeftIcon size={32} weight="bold" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-primary-content p-2 shadow-lg transition-all hover:scale-110"
              aria-label="Next"
            >
              <CaretRightIcon size={32} weight="bold" />
            </button>

            <div className="relative h-full w-full">
              <Image
                src={galleryImages[selectedImageIndex]}
                alt={`Gallery ${selectedImageIndex + 1}`}
                fill
                className="object-cover"
                style={{ objectPosition: galleryItems[selectedImageIndex].objectPosition }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

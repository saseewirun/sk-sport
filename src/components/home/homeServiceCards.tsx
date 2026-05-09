'use client'

import Image from 'next/image'
import { ButtonLink } from '@/components/button'

type HomeLargeServiceCardProps = {
  title: string
  description: string
  image: string
  href: string
  buttonText: string
  imageAlt?: string
  alignButton?: 'top' | 'bottom'
  titleFontSizePx: number
  bodyFontSizePx: number
}

/** Home-only: เทียบ `ServiceCard` แต่ควบคุมขนาดตัวอักษรจาก global Home */
export function HomeLargeServiceCard({
  title,
  description,
  image,
  href,
  buttonText,
  imageAlt,
  alignButton = 'bottom',
  titleFontSizePx,
  bodyFontSizePx,
}: HomeLargeServiceCardProps) {
  const isTop = alignButton === 'top'

  return (
    <div className="w-full min-h-159 max-h-197 md:h-197 group relative flex flex-col justify-between overflow-hidden rounded-xl shadow-lg transition-all duration-300">
      <div className="absolute inset-0 z-0">
        <Image
          src={image}
          alt={imageAlt || title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="service-card-overlay absolute inset-0 z-10" />

      <div className="relative z-20 flex items-start justify-between gap-4 p-6">
        {isTop && (
          <>
            <div className="max-w-md space-y-2">
              <p
                className="font-heading font-semibold leading-tight text-primary-content text-shadow whitespace-pre-wrap"
                style={{ fontSize: `${titleFontSizePx}px` }}
              >
                {title}
              </p>
              <p className="text-primary-content" style={{ fontSize: `${bodyFontSizePx}px` }}>
                {description}
              </p>
            </div>
            <div className="shrink-0">
              <ButtonLink href={href} variant="gradient" size="md" className="text-primary-content">
                {buttonText}
              </ButtonLink>
            </div>
          </>
        )}
      </div>

      <div className="relative z-20 flex items-end justify-between gap-4 p-6">
        {!isTop && (
          <>
            <div className="max-w-md space-y-2">
              <p
                className="font-heading font-semibold leading-tight text-primary-content text-shadow whitespace-pre-wrap"
                style={{ fontSize: `${titleFontSizePx}px` }}
              >
                {title}
              </p>
              <p className="text-primary-content" style={{ fontSize: `${bodyFontSizePx}px` }}>
                {description}
              </p>
            </div>
            <div className="shrink-0">
              <ButtonLink href={href} variant="gradient" size="md" className="text-primary-content">
                {buttonText}
              </ButtonLink>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

type HomeSupportCardProps = {
  title: string
  image: string
  icon: React.ReactNode
  href: string
  imageAlt?: string
  titleFontSizePx: number
}

export function HomeSupportServiceCard({
  title,
  image,
  icon,
  href,
  imageAlt,
  titleFontSizePx,
}: HomeSupportCardProps) {
  return (
    <div className="bg-primary-content group relative flex w-full min-h-159 max-h-197 md:min-h-56 md:max-h-none md:h-56 flex-col justify-end overflow-hidden rounded-lg p-6">
      <div className="absolute inset-0 z-0">
        <Image
          src={image}
          alt={imageAlt || title}
          fill
          className="object-cover opacity-75 transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="support-card-overlay absolute inset-0 z-10" />
      <div className="relative z-20 flex flex-row items-end justify-between gap-4 md:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="shrink-0 text-primary-content">{icon}</div>
          <h3
            className="min-w-0 text-primary-content text-shadow-card"
            style={{ fontSize: `${titleFontSizePx}px` }}
          >
            {title}
          </h3>
        </div>
        <div className="shrink-0">
          <ButtonLink href={href} variant="gradient" size="md" className="text-primary-content">
            Learn more
          </ButtonLink>
        </div>
      </div>
    </div>
  )
}

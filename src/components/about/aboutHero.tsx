import Image from 'next/image'
import { cn } from '@/utils/cn'

interface AboutHeroProps {
  heroTitle?: string | null
  heroSubtitle?: string | null
  heroImageSrc?: string
  titleFontSizePx?: number
  subtitleFontSizePx?: number
}

export default function AboutHero({
  heroTitle,
  heroSubtitle,
  heroImageSrc,
  titleFontSizePx,
  subtitleFontSizePx,
}: AboutHeroProps) {
  return (
    <section className="about-hero-gradient relative w-full overflow-hidden">
      {heroImageSrc && (
        <Image
          src={heroImageSrc}
          alt={heroTitle ?? ''}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      )}
      <div className="about-hero-radial-overlay pointer-events-none absolute inset-0" />
      <div className="relative z-10 container mx-auto flex flex-col items-center justify-center px-6 py-16 text-center md:py-40">
        {heroTitle && (
          <h1
            className={cn(
              'max-w-4xl font-semibold leading-tight tracking-wide text-primary-content drop-shadow-sm',
              titleFontSizePx == null && 'text-3xl md:text-5xl lg:text-6xl',
            )}
            style={titleFontSizePx != null ? { fontSize: `${titleFontSizePx}px` } : undefined}
          >
            {heroTitle}
          </h1>
        )}
        {heroSubtitle && (
          <>
            <p
              className={cn(
                'mt-4 max-w-2xl font-medium leading-relaxed text-primary-content/90 md:mt-5',
                subtitleFontSizePx == null && 'text-sm md:text-lg',
              )}
              style={
                subtitleFontSizePx != null ? { fontSize: `${subtitleFontSizePx}px` } : undefined
              }
            >
              {heroSubtitle}
            </p>
            <div
              className="mt-5 h-0.5 w-12 shrink-0 rounded-full bg-primary-content/50 md:mt-6 md:w-14"
              aria-hidden
            />
          </>
        )}
      </div>
    </section>
  )
}

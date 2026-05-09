import { Suspense } from 'react'
import { getAllProducts } from '@/data/product'
import { getProductsHeroGlobal } from '@/data/productsHero'
import { ProductClient } from '@/components/product/productClient'
import { ProductHero } from '@/components/hero/productHero'
import type { GalleryMedia, HeroMedia, Product } from '@/payload-types'

function resolveImageUrl(image: Product['image']): string {
  if (!image || typeof image === 'string') return ''
  return (image as GalleryMedia).url ?? ''
}

function resolveHeroMediaItems(
  heroMedia: (string | HeroMedia)[] | null | undefined,
): { src: string; alt: string; id: string }[] {
  if (!heroMedia?.length) return []
  return (heroMedia as HeroMedia[])
    .filter((item): item is HeroMedia => typeof item !== 'string' && !!item)
    .map((item) => ({ src: item.url ?? '', alt: item.alt ?? '', id: item.id }))
    .filter((item) => item.src)
}

const DEFAULT_EYEBROW = 'Equipment & Gear'

const TITLE_FONT_MIN = 32
const TITLE_FONT_MAX = 96
const TITLE_FONT_DEFAULT = 56
const SUBTITLE_FONT_MIN = 14
const SUBTITLE_FONT_MAX = 32
const SUBTITLE_FONT_DEFAULT = 20

function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)))
}

function productsHeroTitleFontPx(v: number | null | undefined): number {
  if (v == null || !Number.isFinite(v)) return TITLE_FONT_DEFAULT
  return clampInt(v, TITLE_FONT_MIN, TITLE_FONT_MAX)
}

function productsHeroSubtitleFontPx(v: number | null | undefined): number {
  if (v == null || !Number.isFinite(v)) return SUBTITLE_FONT_DEFAULT
  return clampInt(v, SUBTITLE_FONT_MIN, SUBTITLE_FONT_MAX)
}

export default async function ProductPage() {
  const [products, productsHero] = await Promise.all([getAllProducts(), getProductsHeroGlobal()])

  const heroTitle = productsHero.heroTitle ?? 'Our Products'
  const heroSubtitle =
    productsHero.heroSubtitle ??
    'Professional sports equipment and facility gear, specified and installed by our team for venues of every scale.'
  const heroImages = resolveHeroMediaItems(productsHero.heroMedia)
  const eyebrow =
    typeof productsHero.eyebrow === 'string' && productsHero.eyebrow.trim() !== ''
      ? productsHero.eyebrow.trim()
      : DEFAULT_EYEBROW
  const titleFontPx = productsHeroTitleFontPx(productsHero.titleFontSize)
  const subtitleFontPx = productsHeroSubtitleFontPx(productsHero.subtitleFontSize)

  const productItems = products.map((product) => ({
    id: product.id,
    slug: product.slug ?? product.id,
    title: product.title,
    subtitle: product.subtitle,
    category: product.category,
    description: product.description,
    imageUrl: resolveImageUrl(product.image),
    mode: (product.mode ?? 'quote') as 'quote' | 'buy',
    price: product.price ?? null,
  }))

  return (
    <main className="flex w-full flex-col items-center">
      <ProductHero
        heroImages={heroImages.length > 0 ? heroImages : undefined}
        eyebrow={eyebrow}
        title={heroTitle}
        subtitle={heroSubtitle}
        titleFontSizePx={titleFontPx}
        subtitleFontSizePx={subtitleFontPx}
      />

      <Suspense fallback={null}>
        <ProductClient
          products={productItems}
          categoryTitleFontSize={productsHero.categoryTitleFontSize}
          productCardTitleFontSize={productsHero.productCardTitleFontSize}
          productPriceFontSize={productsHero.productPriceFontSize}
        />
      </Suspense>
    </main>
  )
}

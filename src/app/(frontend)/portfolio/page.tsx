import { PortfolioHero } from '@/components/hero/portfolioHero'
import { PortfolioClient } from '@/components/portfolio'
import { ArticleData } from '@/components/portfolio/cardArticle'
import { getPortfolioArticles } from '@/data/portfolio'
import { getPortfolioHeroGlobal } from '@/data/portfolioHero'
import type { PortfolioArticle, GalleryMedia, HeroMedia } from '@/payload-types'

// Static-first: prerender at build, refresh via ISR + on-demand revalidation.
export const revalidate = 3600

function resolveImageUrl(sectionImage: PortfolioArticle['sectionImage']): string | undefined {
  if (!sectionImage || typeof sectionImage === 'string') return undefined
  return (sectionImage as GalleryMedia).url ?? undefined
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

function mapArticleToCardData(article: PortfolioArticle): ArticleData {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    subtitle: article.subtitle ?? undefined,
    description: article.sectionDetail,
    category: article.tag ?? undefined,
    image: resolveImageUrl(article.sectionImage),
    newest: article.highlight ?? undefined,
  }
}

const HERO_TITLE_MIN = 32
const HERO_TITLE_MAX = 96
const HERO_TITLE_DEFAULT = 56
const HERO_SUB_MIN = 14
const HERO_SUB_MAX = 32
const HERO_SUB_DEFAULT = 20
const HIGHLIGHTS_MIN = 24
const HIGHLIGHTS_MAX = 72
const HIGHLIGHTS_DEFAULT = 40
const SECTION_MIN = 20
const SECTION_MAX = 48
const SECTION_DEFAULT = 28
const CARD_TITLE_MIN = 14
const CARD_TITLE_MAX = 28
const CARD_TITLE_DEFAULT = 18

function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)))
}

function heroTitleFontPx(v: number | null | undefined): number {
  if (v == null || !Number.isFinite(v)) return HERO_TITLE_DEFAULT
  return clampInt(v, HERO_TITLE_MIN, HERO_TITLE_MAX)
}

function heroSubtitleFontPx(v: number | null | undefined): number {
  if (v == null || !Number.isFinite(v)) return HERO_SUB_DEFAULT
  return clampInt(v, HERO_SUB_MIN, HERO_SUB_MAX)
}

function highlightsTitleFontPx(v: number | null | undefined): number {
  if (v == null || !Number.isFinite(v)) return HIGHLIGHTS_DEFAULT
  return clampInt(v, HIGHLIGHTS_MIN, HIGHLIGHTS_MAX)
}

function sectionTitleFontPx(v: number | null | undefined): number {
  if (v == null || !Number.isFinite(v)) return SECTION_DEFAULT
  return clampInt(v, SECTION_MIN, SECTION_MAX)
}

function cardTitleFontPx(v: number | null | undefined): number {
  if (v == null || !Number.isFinite(v)) return CARD_TITLE_DEFAULT
  return clampInt(v, CARD_TITLE_MIN, CARD_TITLE_MAX)
}

export default async function Portfolio() {
  const [articles, portfolioHero] = await Promise.all([
    getPortfolioArticles(),
    getPortfolioHeroGlobal(),
  ])
  const mappedArticles: ArticleData[] = articles.map(mapArticleToCardData)

  const heroTitle = portfolioHero.heroTitle ?? 'PORTFOLIO'
  const heroSubtitle =
    portfolioHero.heroSubtitle ??
    'Venues, facilities, and training projects delivered with precision and care.'
  const heroImages = resolveHeroMediaItems(portfolioHero.heroMedia)
  const heroImageSrc = heroImages.length === 0 ? '/services-hero.png' : undefined

  const titlePx = heroTitleFontPx(portfolioHero.heroTitleFontSize)
  const subPx = heroSubtitleFontPx(portfolioHero.heroSubtitleFontSize)
  const highlightsPx = highlightsTitleFontPx(portfolioHero.highlightsTitleFontSize)
  const sectionPx = sectionTitleFontPx(portfolioHero.sectionTitleFontSize)
  const cardTitlePx = cardTitleFontPx(portfolioHero.cardTitleFontSize)

  return (
    <main className="flex w-full flex-col">
      <PortfolioHero
        variant="listing"
        heroImages={heroImages.length > 0 ? heroImages : undefined}
        imageSrc={heroImageSrc}
        title={heroTitle}
        subtitle={heroSubtitle}
        titleFontSizePx={titlePx}
        subtitleFontSizePx={subPx}
      />
      <PortfolioClient
        articles={mappedArticles}
        highlightsTitleFontSizePx={highlightsPx}
        sectionTitleFontSizePx={sectionPx}
        cardTitleFontSizePx={cardTitlePx}
      />
    </main>
  )
}

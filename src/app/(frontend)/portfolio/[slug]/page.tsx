import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Detail } from '@/components/common'
import { PortfolioHero } from '@/components/hero/portfolioHero'
import { CTAFooter } from '@/components/layout'
import { getPortfolioArticleBySlug, getPortfolioArticles } from '@/data/portfolio'
import { getPortfolioHeroGlobal } from '@/data/portfolioHero'
import type { GalleryMedia } from '@/payload-types'

// Static export: every known slug is prerendered at build; unknown slugs 404.
export const dynamicParams = false

export async function generateStaticParams() {
  const articles = await getPortfolioArticles()
  return articles
    .filter((a): a is typeof a & { slug: string } => Boolean(a.slug))
    .map((a) => ({ slug: a.slug }))
}

function resolveMediaUrl(media: string | GalleryMedia | null | undefined): string {
  if (!media || typeof media === 'string') return ''
  return media.url ?? ''
}

const DETAIL_HERO_TITLE_MIN = 28
const DETAIL_HERO_TITLE_MAX = 72
const DETAIL_HERO_TITLE_DEFAULT = 40
const DETAIL_BODY_MIN = 14
const DETAIL_BODY_MAX = 24
const DETAIL_BODY_DEFAULT = 16
const MORE_TITLE_MIN = 18
const MORE_TITLE_MAX = 36
const MORE_TITLE_DEFAULT = 24
const CARD_TITLE_MIN = 14
const CARD_TITLE_MAX = 28
const CARD_TITLE_DEFAULT = 18

function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)))
}

function detailHeroTitleFontPx(v: number | null | undefined): number {
  if (v == null || !Number.isFinite(v)) return DETAIL_HERO_TITLE_DEFAULT
  return clampInt(v, DETAIL_HERO_TITLE_MIN, DETAIL_HERO_TITLE_MAX)
}

function detailBodyFontPx(v: number | null | undefined): number {
  if (v == null || !Number.isFinite(v)) return DETAIL_BODY_DEFAULT
  return clampInt(v, DETAIL_BODY_MIN, DETAIL_BODY_MAX)
}

function moreProjectsTitleFontPx(v: number | null | undefined): number {
  if (v == null || !Number.isFinite(v)) return MORE_TITLE_DEFAULT
  return clampInt(v, MORE_TITLE_MIN, MORE_TITLE_MAX)
}

function cardTitleFontPx(v: number | null | undefined): number {
  if (v == null || !Number.isFinite(v)) return CARD_TITLE_DEFAULT
  return clampInt(v, CARD_TITLE_MIN, CARD_TITLE_MAX)
}

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const [article, allArticles, portfolioHero] = await Promise.all([
    getPortfolioArticleBySlug(slug),
    getPortfolioArticles(),
    getPortfolioHeroGlobal(),
  ])

  if (!article) {
    notFound()
  }

  const detailHeroTitlePx = detailHeroTitleFontPx(portfolioHero.detailHeroTitleFontSize)
  const detailBodyPx = detailBodyFontPx(portfolioHero.detailBodyFontSize)
  const moreProjectsTitlePx = moreProjectsTitleFontPx(portfolioHero.moreProjectsTitleFontSize)
  const moreCardTitlePx = cardTitleFontPx(portfolioHero.cardTitleFontSize)

  const sectionImageUrl = resolveMediaUrl(article.sectionImage as string | GalleryMedia | null)

  const galleryUrls: string[] = (article.gallery ?? [])
    .map((item) => resolveMediaUrl(item as string | GalleryMedia | null))
    .filter((url) => url.length > 0)

  const publishedDate = new Date(article.createdAt).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const moreArticles = allArticles.filter((a) => a.id !== article.id).slice(0, 3)

  return (
    <main className="flex w-full flex-col items-center bg-header-bg">
      <PortfolioHero
        imageSrc={sectionImageUrl || undefined}
        category={article.tag ?? undefined}
        title={article.title}
        subtitle={article.subtitle ?? undefined}
        publishedDate={publishedDate}
        titleFontSizePx={detailHeroTitlePx}
      />

      <div className="container mx-auto px-6 py-10 md:py-16 flex flex-col gap-10">
        <Detail
          detailTitle=""
          sectionTitle={article.sectionTitle ?? undefined}
          detail={article.sectionDetail}
          images={sectionImageUrl ? [sectionImageUrl] : []}
          variant="row"
          contentBodyFontSizePx={detailBodyPx}
        />

        {galleryUrls.length > 0 && (
          <section className="flex flex-col gap-6">
            <h2 className="text-gradient">Gallery</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
              {galleryUrls.map((url, index) => (
                <div key={index} className="relative aspect-4/3 w-full overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`${article.title} gallery ${index + 1}`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {moreArticles.length > 0 && (
        <section className="w-full bg-primary-content border-t border-base-300">
          <div className="container mx-auto px-6 py-10 md:py-16">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 style={{ fontSize: `${moreProjectsTitlePx}px` }}>More Projects</h2>
              <Link
                href="/portfolio"
                className="body-sm text-primary underline-offset-2 hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8">
              {moreArticles.map((item) => {
                const itemImage = resolveMediaUrl(item.sectionImage as string | GalleryMedia | null)
                return (
                  <Link
                    key={item.id}
                    href={`/portfolio/${item.slug ?? item.id}`}
                    className="group flex flex-col overflow-hidden rounded-box border border-base-300 bg-header-bg shadow-sm transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative h-48 w-full overflow-hidden bg-base-200">
                      {itemImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={itemImage}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="body-sm text-subtle">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 px-4 py-3">
                      {item.tag && (
                        <span className="body-sm text-primary font-semibold uppercase tracking-widest">
                          {item.tag}
                        </span>
                      )}
                      <p
                        className="text-base-content font-medium leading-snug line-clamp-2"
                        style={{ fontSize: `${moreCardTitlePx}px` }}
                      >
                        {item.title}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <CTAFooter />
    </main>
  )
}

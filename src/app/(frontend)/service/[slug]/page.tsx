import { notFound } from 'next/navigation'
import { ServiceHero } from '@/components/hero/serviceHero'
import { CTAFooter } from '@/components/layout'
import {
  Detail,
  type DetailProps,
  RelatedArticle,
  type RelatedArticleItem,
} from '@/components/common'
import { MoreServices } from '@/components/service'
import { getServiceBySlug, getAllServices } from '@/data/service'
import { getPortfolioArticles } from '@/data/portfolio'
import { getServicesHeroGlobal } from '@/data/servicesHero'
import type { Service, ServiceMedia, GalleryMedia } from '@/payload-types'

// Static export: every known slug is prerendered at build; unknown slugs 404.
export const dynamicParams = false

export async function generateStaticParams() {
  const services = await getAllServices()
  return services
    .filter((s): s is typeof s & { slug: string } => Boolean(s.slug))
    .map((s) => ({ slug: s.slug }))
}

const INTEGRATED_SPORTS_INSTALLATION_SLUG = 'integrated-sports-installation'
const SPORTS_VISION_TRAINING_SLUG = 'sports-vision-training'

const DETAIL_HERO_TITLE_MIN = 32
const DETAIL_HERO_TITLE_MAX = 88
const DETAIL_HERO_TITLE_DEFAULT = 48
const DETAIL_CONTENT_TITLE_MIN = 20
const DETAIL_CONTENT_TITLE_MAX = 48
const DETAIL_CONTENT_TITLE_DEFAULT = 28
const DETAIL_CONTENT_BODY_MIN = 14
const DETAIL_CONTENT_BODY_MAX = 24
const DETAIL_CONTENT_BODY_DEFAULT = 16
const RELATED_HEADING_MIN = 18
const RELATED_HEADING_MAX = 36
const RELATED_HEADING_DEFAULT = 22
const RELATED_ITEM_TITLE_MIN = 12
const RELATED_ITEM_TITLE_MAX = 22
const RELATED_ITEM_TITLE_DEFAULT = 14

function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)))
}

function detailHeroTitleFontPx(v: number | null | undefined): number {
  if (v == null || !Number.isFinite(v)) return DETAIL_HERO_TITLE_DEFAULT
  return clampInt(v, DETAIL_HERO_TITLE_MIN, DETAIL_HERO_TITLE_MAX)
}

function detailContentTitleFontPx(v: number | null | undefined): number {
  if (v == null || !Number.isFinite(v)) return DETAIL_CONTENT_TITLE_DEFAULT
  return clampInt(v, DETAIL_CONTENT_TITLE_MIN, DETAIL_CONTENT_TITLE_MAX)
}

function detailContentBodyFontPx(v: number | null | undefined): number {
  if (v == null || !Number.isFinite(v)) return DETAIL_CONTENT_BODY_DEFAULT
  return clampInt(v, DETAIL_CONTENT_BODY_MIN, DETAIL_CONTENT_BODY_MAX)
}

function relatedHeadingFontPx(v: number | null | undefined): number {
  if (v == null || !Number.isFinite(v)) return RELATED_HEADING_DEFAULT
  return clampInt(v, RELATED_HEADING_MIN, RELATED_HEADING_MAX)
}

function relatedItemTitleFontPx(v: number | null | undefined): number {
  if (v == null || !Number.isFinite(v)) return RELATED_ITEM_TITLE_DEFAULT
  return clampInt(v, RELATED_ITEM_TITLE_MIN, RELATED_ITEM_TITLE_MAX)
}

/** Safety standards block on Integrated Sports Installation only */
function isIntegratedSafetyStandardsSection(slug: string, sectionTitle: string | undefined) {
  if (slug !== INTEGRATED_SPORTS_INSTALLATION_SLUG) return false
  const t = (sectionTitle ?? '').trim()
  return t.includes('ความปลอดภัย') || /\bsafety\b/i.test(t)
}

function mapSectionToDetailProps(
  section: NonNullable<Service['sections']>[number],
): DetailProps & { _id: string } {
  const resolveImageUrl = (media: string | ServiceMedia | null | undefined): string => {
    if (!media || typeof media === 'string') return ''
    return media.url ?? ''
  }

  if (section.variant === 'row') {
    return {
      _id: section.id ?? '',
      detailTitle: '',
      sectionTitle: section.sectionTitle ?? '',
      detail: section.description ?? '',
      variant: 'row',
      alignment: (section.alignment as 'left' | 'right') ?? 'left',
      images: [resolveImageUrl(section.image)],
      tags: [],
    }
  }

  return {
    _id: section.id ?? '',
    detailTitle: '',
    sectionTitle: section.sectionTitle ?? '',
    detail: section.description ?? '',
    variant: 'column',
    images: (section.images ?? []).map((item) => resolveImageUrl(item.image)),
    tags: [],
  }
}

function resolveGalleryUrl(media: string | GalleryMedia | null | undefined): string {
  if (!media || typeof media === 'string') return ''
  return media.url ?? ''
}

function mapServiceToMoreServicesItem(service: Service) {
  const hero = service.hero
  const imageUrl = hero && typeof hero !== 'string' ? (hero.url ?? '') : ''

  return {
    id: service.id,
    title: service.title,
    image: imageUrl,
    href: `/service/${service.slug}`,
  }
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const [serviceData, allServices, recentPortfolioArticles, servicesHero] = await Promise.all([
    getServiceBySlug(slug),
    getAllServices(),
    getPortfolioArticles(),
    getServicesHeroGlobal(),
  ])

  if (!serviceData) {
    notFound()
  }

  const detailHeroTitlePx = detailHeroTitleFontPx(servicesHero.detailHeroTitleFontSize)
  const contentTitlePx = detailContentTitleFontPx(servicesHero.detailContentTitleFontSize)
  const contentBodyPx = detailContentBodyFontPx(servicesHero.detailContentBodyFontSize)
  const relatedHeadingPx = relatedHeadingFontPx(servicesHero.relatedHeadingFontSize)
  const relatedItemTitlePx = relatedItemTitleFontPx(servicesHero.relatedItemTitleFontSize)

  const heroImage =
    serviceData.hero && typeof serviceData.hero !== 'string' ? (serviceData.hero.url ?? '') : ''

  const serviceDetails = (serviceData.sections ?? []).map(mapSectionToDetailProps).map((item) => {
    if (isIntegratedSafetyStandardsSection(slug, item.sectionTitle)) {
      return {
        ...item,
        variant: 'column' as const,
        images: (item.images ?? []).filter((url) => Boolean(url)),
        imagePresentation: 'certificate' as const,
      }
    }
    if (slug === SPORTS_VISION_TRAINING_SLUG) {
      return {
        ...item,
        variant: 'column' as const,
      }
    }
    return item
  })

  const moreServices = allServices.map(mapServiceToMoreServicesItem)

  const relatedArticles: RelatedArticleItem[] = recentPortfolioArticles
    .slice(0, 4)
    .map((article) => ({
      id: article.id,
      title: article.title,
      href: article.slug ? `/portfolio/${article.slug}` : '/portfolio',
      image: resolveGalleryUrl(article.sectionImage as string | GalleryMedia | null),
    }))

  return (
    <main className="flex w-full flex-col items-center">
      <ServiceHero
        imageSrc={heroImage}
        titleLine1={serviceData.title}
        showCta={false}
        contentPosition="bottom"
        titleFontSizePx={detailHeroTitlePx}
      />
      <div className="flex w-full flex-col items-center justify-center bg-header-bg">
        <div className="w-full py-6 md:py-8">
          <div className="flex flex-col lg:grid lg:grid-cols-3">
            <div className="order-1 lg:order-1 lg:col-span-2 px-4 flex flex-col gap-8">
              {serviceDetails.map((item, index) => (
                <Detail
                  key={item._id || index}
                  {...item}
                  contentTitleFontSizePx={contentTitlePx}
                  contentBodyFontSizePx={contentBodyPx}
                />
              ))}
            </div>

            <div className="order-4 mt-8 px-4 lg:order-2 lg:col-span-1 lg:mt-0">
              {relatedArticles.length > 0 && (
                <RelatedArticle
                  articles={relatedArticles}
                  relatedHeadingFontSizePx={relatedHeadingPx}
                  relatedItemTitleFontSizePx={relatedItemTitlePx}
                />
              )}
            </div>

            <div className="order-2 pt-4 lg:order-3 col-span-3">
              <CTAFooter variant="light" />
            </div>

            <div className="order-3 w-full pt-4 pb-8 px-4 md:pb-16 lg:order-4 lg:col-span-3 lg:pt-8">
              <MoreServices services={moreServices} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

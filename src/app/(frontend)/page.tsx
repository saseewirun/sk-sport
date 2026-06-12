import { getHomeGlobal } from '@/data'
import { getContactHeroGlobal } from '@/data/contactHero'
import { getPortfolioArticles } from '@/data/portfolio'
import { getServiceBySlug } from '@/data/service'
import { getAllProducts } from '@/data/product'
import {
  Accomplishment,
  AboutCompany,
  ContactSection,
  Gallery,
  HomeHero,
  OurProducts,
  PartnersSection,
  Services,
} from '@/components/home'
import { CTAFooter } from '@/components/layout'
import type { GalleryMedia, Home, PartnerMedia, Service, ServiceMedia } from '@/payload-types'
import './styles.css'

function resolveMediaUrl(media: string | GalleryMedia | null | undefined): string {
  if (!media || typeof media === 'string') return ''
  return media.url ?? ''
}

/** ตำแหน่งโฟกัสของรูป (object-position) จาก focalX/focalY — กันภาพโดนตัดหัว */
function resolveObjectPosition(
  media: string | GalleryMedia | null | undefined,
): string | undefined {
  if (!media || typeof media === 'string') return undefined
  const m = media as { focalX?: number | null; focalY?: number | null }
  if (m.focalX == null && m.focalY == null) return undefined
  return `${m.focalX ?? 50}% ${m.focalY ?? 50}%`
}

const INTEGRATED_SPORTS_INSTALLATION_SLUG = 'integrated-sports-installation'
const EQUIPMENT_FOR_TOP_GYMNASTS_SLUG = 'equipment-for-top-gymnasts'
const SPORTS_VISION_TRAINING_SLUG = 'sports-vision-training'
const HEALTH_MANAGEMENT_SYSTEM_SLUG = 'health-management-system'
const UNITED_DISCOVERY_SLUG = 'united-discovery'

function resolveServiceHeroUrl(hero: Service['hero']): string {
  if (!hero || typeof hero === 'string') return ''
  return (hero as ServiceMedia).url ?? ''
}

function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)))
}

function px(v: number | null | undefined, min: number, max: number, fallback: number): number {
  if (v == null || !Number.isFinite(v)) return fallback
  return clampInt(v, min, max)
}

function homeTypography(h: Home) {
  // ฟิลด์ฟอนต์ใหม่ราย section ยังไม่อยู่ใน payload type → อ่านผ่าน cast
  const x = h as unknown as Record<string, unknown>
  const num = (k: string) => x[k] as number | null | undefined
  return {
    heroTitle: px(h.heroTitleFontSize, 32, 96, 56),
    heroSubtitle: px(h.heroSubtitleFontSize, 14, 32, 20),
    sectionTitle: px(h.sectionTitleFontSize, 20, 56, 32),
    highlightTitle: px(h.highlightTitleFontSize, 20, 48, 28),
    highlightBody: px(h.highlightBodyFontSize, 14, 24, 16),
    cardTitle: px(h.cardTitleFontSize, 16, 36, 20),
    cardBody: px(h.cardBodyFontSize, 12, 22, 14),
    servicesTitle: px(num('servicesTitleFontSize'), 20, 56, 32),
    productsTitle: px(num('productsTitleFontSize'), 20, 56, 32),
    accomplishmentTitle: px(num('accomplishmentTitleFontSize'), 20, 56, 32),
    aboutButton: px(num('aboutButtonFontSize'), 12, 24, 16),
    contactSectionTitle: px(num('contactSectionTitleFontSize'), 20, 56, 32),
  }
}

function resolvePartnerLogos(
  partners: Home['partners'],
): { id: string; name: string; logoUrl: string }[] {
  if (!partners?.length) return []
  return partners
    .map((p) => {
      if (!p || typeof p === 'string') return null
      const doc = p as PartnerMedia
      const logoUrl = doc.url ?? ''
      if (!logoUrl) return null
      return { id: doc.id, name: doc.name, logoUrl }
    })
    .filter((item): item is { id: string; name: string; logoUrl: string } => item !== null)
}

export default async function HomePage() {
  const [
    homeData,
    contactHeroData,
    portfolioArticles,
    allProducts,
    integratedSportsService,
    equipmentForTopGymnastsService,
    sportsVisionTrainingService,
    healthManagementSystemService,
    unitedDiscoveryService,
  ] = await Promise.all([
    getHomeGlobal(),
    getContactHeroGlobal(),
    getPortfolioArticles(),
    getAllProducts(),
    getServiceBySlug(INTEGRATED_SPORTS_INSTALLATION_SLUG),
    getServiceBySlug(EQUIPMENT_FOR_TOP_GYMNASTS_SLUG),
    getServiceBySlug(SPORTS_VISION_TRAINING_SLUG),
    getServiceBySlug(HEALTH_MANAGEMENT_SYSTEM_SLUG),
    getServiceBySlug(UNITED_DISCOVERY_SLUG),
  ])

  const partnerLogos = resolvePartnerLogos(homeData.partners)
  const tf = homeTypography(homeData)

  const productTeasers = allProducts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    imageUrl: resolveMediaUrl(p.image as string | GalleryMedia | null),
  }))

  const integratedSportsInstallationTeaser = integratedSportsService
    ? {
        title: integratedSportsService.title,
        description: integratedSportsService.subtitle ?? '',
        image:
          resolveServiceHeroUrl(integratedSportsService.hero) || '/Contact Section BG Desktop.png',
        href: `/service/${integratedSportsService.slug}`,
        imageAlt: integratedSportsService.title,
      }
    : null

  const equipmentForTopGymnastsTeaser = equipmentForTopGymnastsService
    ? {
        title: equipmentForTopGymnastsService.title,
        description: equipmentForTopGymnastsService.subtitle ?? '',
        image:
          resolveServiceHeroUrl(equipmentForTopGymnastsService.hero) ||
          '/Contact Section BG Desktop.png',
        href: `/service/${equipmentForTopGymnastsService.slug}`,
        imageAlt: equipmentForTopGymnastsService.title,
      }
    : null

  const sportsVisionTrainingTeaser = sportsVisionTrainingService
    ? {
        title: sportsVisionTrainingService.title,
        image:
          resolveServiceHeroUrl(sportsVisionTrainingService.hero) ||
          '/Contact Section BG Desktop.png',
        href: `/service/${sportsVisionTrainingService.slug}`,
        imageAlt: sportsVisionTrainingService.title,
      }
    : null

  const healthManagementSystemTeaser = healthManagementSystemService
    ? {
        title: healthManagementSystemService.title,
        image:
          resolveServiceHeroUrl(healthManagementSystemService.hero) ||
          '/Contact Section BG Desktop.png',
        href: `/service/${healthManagementSystemService.slug}`,
        imageAlt: healthManagementSystemService.title,
      }
    : null

  const unitedDiscoveryTeaser = unitedDiscoveryService
    ? {
        title: unitedDiscoveryService.title,
        image:
          resolveServiceHeroUrl(unitedDiscoveryService.hero) || '/Contact Section BG Desktop.png',
        href: `/service/${unitedDiscoveryService.slug}`,
        imageAlt: unitedDiscoveryService.title,
      }
    : null

  const accomplishmentItems = portfolioArticles.slice(0, 5).map((article) => ({
    id: article.id,
    image: resolveMediaUrl(article.sectionImage as string | GalleryMedia | null),
    objectPosition: resolveObjectPosition(article.sectionImage as string | GalleryMedia | null),
    date: new Date(article.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    }),
    title: article.title,
    href: article.slug ? `/portfolio/${article.slug}` : '/portfolio',
  }))

  return (
    <div className="mx-auto flex min-h-[60vh] w-full flex-col items-center justify-center bg-header-bg">
      <HomeHero
        media={homeData.heroMedia}
        titleFontSizePx={tf.heroTitle}
        subtitleFontSizePx={tf.heroSubtitle}
      />
      <PartnersSection partners={partnerLogos} />
      <Services
        integratedSportsInstallationTeaser={integratedSportsInstallationTeaser}
        equipmentForTopGymnastsTeaser={equipmentForTopGymnastsTeaser}
        sportsVisionTrainingTeaser={sportsVisionTrainingTeaser}
        healthManagementSystemTeaser={healthManagementSystemTeaser}
        unitedDiscoveryTeaser={unitedDiscoveryTeaser}
        sectionTitleFontSizePx={tf.servicesTitle}
        taglineFontSizePx={tf.highlightBody}
        cardTitleFontSizePx={tf.cardTitle}
        cardBodyFontSizePx={tf.cardBody}
      />
      <OurProducts
        products={productTeasers}
        sectionTitleFontSizePx={tf.productsTitle}
        cardTitleFontSizePx={tf.cardTitle}
      />
      <Accomplishment
        items={accomplishmentItems}
        sectionTitleFontSizePx={tf.accomplishmentTitle}
        cardTitleFontSizePx={tf.cardTitle}
      />
      <CTAFooter />
      <AboutCompany
        sectionTitleFontSizePx={tf.sectionTitle}
        highlightTitleFontSizePx={tf.highlightTitle}
        highlightBodyFontSizePx={tf.highlightBody}
        cardBodyFontSizePx={tf.cardBody}
        buttonFontSizePx={tf.aboutButton}
      />
      <ContactSection
        sectionTitleFontSizePx={tf.contactSectionTitle}
        mapEmbedSrc={contactHeroData.googleMapEmbedUrl ?? undefined}
      />
      <Gallery media={homeData.galleryMedia} sectionTitleFontSizePx={tf.sectionTitle} />
    </div>
  )
}

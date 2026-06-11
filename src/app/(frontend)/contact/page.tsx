import { ContactForm, ContactPageHero } from '@/components/contact'
import { getContactHeroGlobal } from '@/data/contactHero'
import { CONTACT } from '@/const/contact'
import type { ContactHero as ContactHeroType, Home } from '@/payload-types'

const FALLBACK_MEDIA = [
  { id: '1', url: '/Contact Section BG Desktop.png', alt: 'Contact Background' },
] as unknown as Home['heroMedia']

function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)))
}

function px(v: number | null | undefined, min: number, max: number, d: number) {
  if (v == null || !Number.isFinite(v)) return d
  return clampInt(v, min, max)
}

function contactTypography(h: ContactHeroType) {
  return {
    heroTitlePx: px(h.heroTitleFontSize, 32, 96, 56),
    heroSubtitlePx: px(h.heroSubtitleFontSize, 14, 32, 20),
    contactSectionTitlePx: px(h.contactSectionTitleFontSize, 20, 48, 28),
    contactInfoTitlePx: px(h.contactInfoTitleFontSize, 14, 32, 18),
    contactInfoBodyPx: px(h.contactInfoBodyFontSize, 14, 24, 16),
    formLabelPx: px(h.formLabelFontSize, 12, 20, 14),
    formInputPx: px(h.formInputFontSize, 14, 22, 16),
  }
}

export default async function Contact() {
  const contactHero = await getContactHeroGlobal()
  const t = contactTypography(contactHero)

  const heroMedia = contactHero.heroMedia?.length ? contactHero.heroMedia : FALLBACK_MEDIA
  const heroTitle = contactHero.heroTitle ?? 'Contact us'
  const heroDescription = contactHero.heroSubtitle ?? (
    <>
      Your Partner for World-Class Sports Facility Development.
      <br />
      We&apos;re here to help with equipment, installation, and facility planning.
    </>
  )

  const mapEmbedSrc = contactHero.googleMapEmbedUrl || CONTACT.mapEmbedSrc

  return (
    <div className="w-full bg-header-bg">
      <ContactPageHero
        media={heroMedia}
        title={heroTitle}
        description={heroDescription}
        titleFontSizePx={t.heroTitlePx}
        subtitleFontSizePx={t.heroSubtitlePx}
      />
      <div className="relative z-20">
        <ContactForm
          contactSectionTitleFontSizePx={t.contactSectionTitlePx}
          contactInfoTitleFontSizePx={t.contactInfoTitlePx}
          contactInfoBodyFontSizePx={t.contactInfoBodyPx}
          formLabelFontSizePx={t.formLabelPx}
          formInputFontSizePx={t.formInputPx}
        />
      </div>
      <div className="w-full h-80 md:h-120 relative overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={mapEmbedSrc}
          className="absolute inset-0 w-full h-full"
          title="Google Map"
          loading="lazy"
        />
      </div>
    </div>
  )
}

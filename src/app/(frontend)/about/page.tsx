import { getAboutGlobal } from '@/data/about'
import { getAboutHeroGlobal } from '@/data/aboutHero'
import { getVisibleFounders } from '@/data/founders'
import AboutHero from '@/components/about/aboutHero'
import AboutHistory from '@/components/about/aboutHistory'
import AboutMissionVision from '@/components/about/aboutMissionVision'
import AboutFounder from '@/components/about/aboutFounder'
import AboutVideoSection from '@/components/about/aboutVideoSection'
import type { About as AboutType, AboutHero as AboutHeroType, HeroMedia } from '@/payload-types'

function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)))
}

function pxOr(v: number | null | undefined, min: number, max: number, fallback: number): number {
  if (v == null || !Number.isFinite(v)) return fallback
  return clampInt(v, min, max)
}

function heroTitlePx(h: AboutHeroType) {
  return pxOr(h.heroTitleFontSize, 32, 96, 56)
}
function heroSubPx(h: AboutHeroType) {
  return pxOr(h.heroSubtitleFontSize, 14, 32, 20)
}
function sectionTitlePx(a: AboutType) {
  return pxOr(a.sectionTitleFontSize, 22, 56, 32)
}
function highlightTitlePx(a: AboutType) {
  return pxOr(a.highlightCardTitleFontSize, 16, 36, 20)
}
function highlightBodyPx(a: AboutType) {
  return pxOr(a.highlightCardBodyFontSize, 13, 24, 15)
}
function statNumPx(a: AboutType) {
  return pxOr(a.statNumberFontSize, 20, 48, 28)
}
function statLabelPx(a: AboutType) {
  return pxOr(a.statLabelFontSize, 12, 22, 14)
}
function mvTitlePx(a: AboutType) {
  return pxOr(a.missionVisionTitleFontSize, 20, 48, 28)
}
function mvBodyPx(a: AboutType) {
  return pxOr(a.missionVisionBodyFontSize, 14, 24, 16)
}
function fCardTitlePx(a: AboutType) {
  return pxOr(a.founderCardTitleFontSize, 20, 48, 28)
}
function fCardBodyPx(a: AboutType) {
  return pxOr(a.founderCardBodyFontSize, 14, 24, 16)
}
function fQuotePx(a: AboutType) {
  return pxOr(a.founderQuoteFontSize, 14, 28, 18)
}
function videoSectionTitlePx(a: AboutType) {
  return pxOr(a.videoSectionTitleFontSize, 20, 56, 32)
}

function resolveHeroMediaUrl(
  heroMedia: (string | HeroMedia)[] | null | undefined,
): string | undefined {
  if (!heroMedia?.length) return undefined
  const first = heroMedia[0]
  if (!first || typeof first === 'string') return undefined
  return (first as HeroMedia).url ?? undefined
}

export default async function AboutPage() {
  const [about, aboutHero, cmsFounders] = await Promise.all([
    getAboutGlobal(),
    getAboutHeroGlobal(),
    getVisibleFounders(),
  ])

  const heroImageSrc = resolveHeroMediaUrl(aboutHero.heroMedia)

  return (
    <main className="flex w-full flex-col items-center">
      <AboutHero
        heroTitle={aboutHero.heroTitle ?? about.heroTitle}
        heroSubtitle={aboutHero.heroSubtitle ?? about.heroSubtitle}
        heroImageSrc={heroImageSrc}
        titleFontSizePx={heroTitlePx(aboutHero)}
        subtitleFontSizePx={heroSubPx(aboutHero)}
      />
      <AboutHistory
        historySectionTitle={about.historySectionTitle}
        companyName={about.companyName}
        historyDescription={about.historyDescription}
        historyHighlights={about.historyHighlights}
        sectionTitleFontSizePx={sectionTitlePx(about)}
        highlightCardTitleFontSizePx={highlightTitlePx(about)}
        highlightCardBodyFontSizePx={highlightBodyPx(about)}
        statNumberFontSizePx={statNumPx(about)}
        statLabelFontSizePx={statLabelPx(about)}
      />
      <AboutMissionVision
        missionTitle={about.missionTitle}
        missionDescription={about.missionDescription}
        visionTitle={about.visionTitle}
        visionDescription={about.visionDescription}
        missionVisionTitleFontSizePx={mvTitlePx(about)}
        missionVisionBodyFontSizePx={mvBodyPx(about)}
      />
      <AboutVideoSection
        videoSectionTitle={about.videoSectionTitle ?? 'Video'}
        videoSectionTitleFontSizePx={videoSectionTitlePx(about)}
        youtubeVideos={about.youtubeVideos}
      />
      <AboutFounder
        founderSectionTitle={
          about.founderSectionTitle?.trim() === 'Founder'
            ? 'Team Member'
            : (about.founderSectionTitle ?? 'Team Member')
        }
        cmsFounders={cmsFounders}
        founderImage={about.founderImage}
        founderName={about.founderName}
        founderRole={about.founderRole}
        founderDescription={about.founderDescription}
        founderQuote={about.founderQuote}
        sectionTitleFontSizePx={sectionTitlePx(about)}
        founderCardTitleFontSizePx={fCardTitlePx(about)}
        founderCardBodyFontSizePx={fCardBodyPx(about)}
        founderQuoteFontSizePx={fQuotePx(about)}
      />
    </main>
  )
}

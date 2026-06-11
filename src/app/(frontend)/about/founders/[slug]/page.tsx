import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getFounderBySlug, getVisibleFounders } from '@/data/founders'
import { getAboutGlobal } from '@/data/about'
import { FounderDetailImages } from '@/components/about/founderDetailImages'
import { resolveFounderDetailImages } from '@/components/about/founderMedia'

type PageProps = { params: Promise<{ slug: string }> }

// Static export: every known slug is prerendered at build; unknown slugs 404.
export const dynamicParams = false

export async function generateStaticParams() {
  const founders = await getVisibleFounders()
  return founders
    .filter((f): f is typeof f & { slug: string } => Boolean(f.slug))
    .map((f) => ({ slug: f.slug }))
}

function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)))
}

function detailTitlePx(v: number | null | undefined) {
  if (v == null || !Number.isFinite(v)) return 42
  return clampInt(v, 28, 72)
}
function detailBodyPx(v: number | null | undefined) {
  if (v == null || !Number.isFinite(v)) return 16
  return clampInt(v, 14, 24)
}

export default async function FounderDetailPage({ params }: PageProps) {
  const { slug } = await params
  const [founder, about] = await Promise.all([
    getFounderBySlug(decodeURIComponent(slug)),
    getAboutGlobal(),
  ])
  if (!founder) {
    notFound()
  }

  const titleSize = detailTitlePx(about.founderDetailTitleFontSize)
  const bodySize = detailBodyPx(about.founderDetailBodyFontSize)

  const images = resolveFounderDetailImages(founder)
  const label = (founder.role?.trim() || 'Founder').toUpperCase()

  return (
    <main className="flex w-full flex-col items-center bg-header-bg">
      <div className="container mx-auto w-full max-w-6xl px-6 py-10 md:py-14">
        <Link
          href="/about"
          className="mb-8 inline-block text-sm font-medium text-primary hover:underline"
        >
          ← Back to About
        </Link>

        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
          <div className="w-full min-w-0 max-w-full lg:max-w-md lg:shrink-0 xl:max-w-lg">
            <FounderDetailImages images={images} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-founder-label tracking-founder-role font-semibold uppercase text-primary">
              {label}
            </p>
            <h1
              className="mt-2 font-semibold text-base-content"
              style={{ fontSize: `${titleSize}px` }}
            >
              {founder.name}
            </h1>
            {founder.role && (
              <p className="mt-2 text-base text-base-content/60 md:text-lg">{founder.role}</p>
            )}

            {founder.description?.trim() && (
              <p
                className="mt-6 whitespace-pre-line leading-relaxed text-base-content/85"
                style={{ fontSize: `${bodySize}px` }}
              >
                {founder.description}
              </p>
            )}

            {founder.quote?.trim() && (
              <blockquote className="mt-8 rounded-r-xl border-l-4 border-primary bg-base-200/30 py-5 pl-6 pr-4">
                <p className="text-lg font-medium italic leading-relaxed text-base-content md:text-xl">
                  &ldquo;{founder.quote.trim()}&rdquo;
                </p>
              </blockquote>
            )}

            <div className="mt-10">
              <Link href="/contact" className="btn btn-gradient-solid-border btn-md">
                <span className="text-primary">Contact Us</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

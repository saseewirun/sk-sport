import type { PortfolioArticle } from '@/payload-types'
import { byCreatedAtDesc, loadCollection } from '@/lib/contentStore'

/** Align route `[slug]` with the stored `slug` (trim + safe URI decode for encoded segments). */
function normalizePortfolioSlugParam(raw: string): string {
  if (typeof raw !== 'string') return ''
  const trimmed = raw.trim()
  if (!trimmed) return ''
  try {
    return decodeURIComponent(trimmed).trim()
  } catch {
    return trimmed
  }
}

/**
 * Some customer-entered slugs contain characters that are invalid in Windows
 * filenames (e.g. `|`), which breaks `next build` because prerendered pages are
 * written to disk under the slug. Replace them with `-` so the slug is safe as
 * both a URL segment and a filename.
 */
function fileSafeSlug(slug: string): string {
  return slug
    .replace(/[<>:"/\\|?*]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const getPortfolioArticles = async (): Promise<PortfolioArticle[]> => {
  return loadCollection<PortfolioArticle>('portfolio-articles')
    .map((a) => (a.slug ? { ...a, slug: fileSafeSlug(a.slug) } : a))
    .sort(byCreatedAtDesc)
}

export const getPortfolioArticleBySlug = async (slug: string): Promise<PortfolioArticle | null> => {
  const normalized = normalizePortfolioSlugParam(slug)
  if (!normalized) return null
  const articles = await getPortfolioArticles()
  // Articles carry file-safe slugs; sanitizing the param too lets old URLs
  // that still contain the raw characters keep resolving.
  const target = fileSafeSlug(normalized)
  return articles.find((a) => a.slug === target) ?? null
}

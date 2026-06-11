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

export const getPortfolioArticles = async (): Promise<PortfolioArticle[]> => {
  return loadCollection<PortfolioArticle>('portfolio-articles').sort(byCreatedAtDesc)
}

export const getPortfolioArticleBySlug = async (slug: string): Promise<PortfolioArticle | null> => {
  const normalized = normalizePortfolioSlugParam(slug)
  if (!normalized) return null
  const articles = await getPortfolioArticles()
  return articles.find((a) => a.slug === normalized) ?? null
}

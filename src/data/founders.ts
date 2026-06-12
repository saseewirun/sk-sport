import type { Founder } from '@/payload-types'
import { loadCollection } from '@/lib/contentStore'

export const getVisibleFounders = async (): Promise<Founder[]> => {
  return loadCollection<Founder>('founders')
    .filter((f) => f.isVisible !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

export const getFounderBySlug = async (slug: string): Promise<Founder | null> => {
  const visible = await getVisibleFounders()
  return visible.find((f) => f.slug === slug) ?? null
}

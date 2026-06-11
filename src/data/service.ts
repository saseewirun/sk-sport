import type { Service } from '@/payload-types'
import { loadCollection } from '@/lib/contentStore'

export const getAllServices = async (): Promise<Service[]> => {
  return loadCollection<Service>('services')
}

export const getServiceBySlug = async (slug: string): Promise<Service | null> => {
  const all = await getAllServices()
  return all.find((s) => s.slug === slug) ?? null
}

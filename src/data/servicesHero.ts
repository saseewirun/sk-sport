import type { ServicesHero } from '@/payload-types'
import { loadGlobal } from '@/lib/contentStore'

export const getServicesHeroGlobal = async (): Promise<ServicesHero> => {
  return loadGlobal<ServicesHero>('services-hero')
}

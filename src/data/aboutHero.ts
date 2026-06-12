import type { AboutHero } from '@/payload-types'
import { loadGlobal } from '@/lib/contentStore'

export const getAboutHeroGlobal = async (): Promise<AboutHero> => {
  return loadGlobal<AboutHero>('about-hero')
}

import type { About } from '@/payload-types'
import { loadGlobal } from '@/lib/contentStore'

export const getAboutGlobal = async (): Promise<About> => {
  return loadGlobal<About>('about')
}

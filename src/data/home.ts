import type { Home } from '@/payload-types'
import { loadGlobal } from '@/lib/contentStore'

export const getHomeGlobal = async (): Promise<Home> => {
  return loadGlobal<Home>('home')
}

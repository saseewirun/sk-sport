import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { cache } from 'react'

/**
 * File-based content store — the git-based replacement for Payload DB reads.
 *
 * Content lives in the repo:
 *   content/globals/<slug>.json        one JSON document per global
 *   content/collections/<slug>.json    array of documents per collection
 *   public/uploads/<prefix>/<file>     media files (downloaded by the export
 *                                      script from Supabase storage)
 *
 * Documents keep the exact shape Payload produced (depth-1 populated), so all
 * existing `@/payload-types` types and page components keep working unchanged.
 *
 * Media URL localization: exported docs may still carry absolute Supabase URLs
 * (or `/api/<media>/file/<name>` URLs). `localizeMediaUrls` rewrites any URL
 * containing a known media prefix to the local `/uploads/<prefix>/<filename>`
 * path so the static site serves images from the repo, not from Supabase.
 */

const CONTENT_DIR = path.join(process.cwd(), 'content')

const MEDIA_PREFIXES = [
  'hero-media',
  'gallery-media',
  'service-media',
  'partner-media',
  'payment-slips',
] as const

/** Rewrite a single URL to its local /uploads path when it targets known media. */
function localizeUrl(url: string): string {
  if (url.startsWith('/uploads/')) return url
  for (const prefix of MEDIA_PREFIXES) {
    const marker = `${prefix}/`
    const idx = url.lastIndexOf(marker)
    if (idx !== -1) {
      const filename = url.slice(idx + marker.length).split('?')[0]
      if (filename && !filename.includes('/')) {
        return `/uploads/${prefix}/${decodeURIComponent(filename)}`
      }
    }
    // Payload REST style: /api/<prefix>/file/<filename>
    const restMarker = `/api/${prefix}/file/`
    const restIdx = url.indexOf(restMarker)
    if (restIdx !== -1) {
      const filename = url.slice(restIdx + restMarker.length).split('?')[0]
      if (filename) return `/uploads/${prefix}/${decodeURIComponent(filename)}`
    }
  }
  return url
}

/** Deep-walk any exported JSON and localize every media `url`/`thumbnailURL`. */
function localizeMediaUrls<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => localizeMediaUrls(v)) as T
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if ((k === 'url' || k === 'thumbnailURL') && typeof v === 'string') {
        out[k] = localizeUrl(v)
      } else {
        out[k] = localizeMediaUrls(v)
      }
    }
    return out as T
  }
  return value
}

function readJson<T>(file: string): T {
  const raw = readFileSync(file, 'utf8')
  return localizeMediaUrls(JSON.parse(raw) as T)
}

/**
 * Load a global document. Throws a descriptive error when the content file is
 * missing — that means the Supabase export has not been run/committed yet.
 */
export const loadGlobal = cache(<T>(slug: string): T => {
  const file = path.join(CONTENT_DIR, 'globals', `${slug}.json`)
  if (!existsSync(file)) {
    throw new Error(
      `Missing content file content/globals/${slug}.json — run the export ` +
        `(npx payload run scripts/export-from-payload.mjs) and commit content/.`,
    )
  }
  return readJson<T>(file)
})

/** Load a collection (array of docs). Missing file → empty list. */
export const loadCollection = cache(<T>(slug: string): T[] => {
  const file = path.join(CONTENT_DIR, 'collections', `${slug}.json`)
  if (!existsSync(file)) {
    return []
  }
  return readJson<T[]>(file)
})

/** Sort helper matching Payload's `-createdAt` (newest first, stable). */
export function byCreatedAtDesc<T extends { createdAt?: string | null }>(a: T, b: T): number {
  const ta = a.createdAt ? Date.parse(a.createdAt) : 0
  const tb = b.createdAt ? Date.parse(b.createdAt) : 0
  return tb - ta
}

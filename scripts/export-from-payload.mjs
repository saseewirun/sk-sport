/**
 * scripts/export-from-payload.mjs
 *
 * SAFE, READ-ONLY export of ALL Payload content + media out of Supabase into
 * plain files in the repo. This is the data-loss-prevention cornerstone of the
 * git-based-CMS migration: run it ONCE with the real production credentials and
 * everything the customer ever entered is captured as files you can commit.
 *
 * What it does (never writes/deletes anything in Supabase):
 *   1. Dumps every GLOBAL      → content/globals/<slug>.json
 *   2. Dumps every COLLECTION  → content/collections/<slug>.json   (full docs)
 *   3. Downloads every MEDIA   → public/uploads/<prefix>/<filename>
 *   4. Writes a manifest       → content/_export-manifest.json     (counts + ts)
 *
 * Usage (run through Payload so the TS config + .env load correctly):
 *   1. cp .env.example .env   and fill in the REAL Supabase values
 *      (DATABASE_URI, PAYLOAD_SECRET, S3_* — same ones the live site uses)
 *   2. npx payload run scripts/export-from-payload.mjs
 *
 * Re-runnable: it overwrites the json/manifest and re-downloads media. It does
 * NOT touch the database or the S3 bucket in any way.
 */

import { mkdir, writeFile } from 'fs/promises'
import { createWriteStream, existsSync } from 'fs'
import { pipeline } from 'stream/promises'
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'

const ROOT = process.cwd()
const CONTENT_DIR = path.join(ROOT, 'content')
const UPLOADS_DIR = path.join(ROOT, 'public', 'uploads')

// Media collections (slug + the prefix used in payload.config s3Storage).
const MEDIA_COLLECTIONS = [
  'hero-media',
  'gallery-media',
  'service-media',
  'partner-media',
  'payment-slips',
]

function log(msg) {
  console.log(msg)
}

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true })
}

async function writeJson(file, data) {
  await ensureDir(path.dirname(file))
  await writeFile(file, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

/** Download a single URL to dest (skips if already present). Best-effort. */
async function downloadTo(url, dest) {
  if (!url) return { skipped: 'no-url' }
  if (existsSync(dest)) return { skipped: 'exists' }
  await ensureDir(path.dirname(dest))
  const res = await fetch(url)
  if (!res.ok || !res.body) {
    return { error: `HTTP ${res.status}` }
  }
  await pipeline(res.body, createWriteStream(dest))
  return { ok: true }
}

async function main() {
  if (!process.env.DATABASE_URI || !process.env.PAYLOAD_SECRET) {
    console.error(
      '❌ Missing DATABASE_URI / PAYLOAD_SECRET. Copy .env.example to .env and\n' +
        '   fill in the real Supabase credentials before running this export.',
    )
    process.exit(1)
  }

  log('Connecting to Payload (read-only export)…')
  const payload = await getPayload({ config })

  const cfg = await config
  const collectionSlugs = cfg.collections.map((c) => c.slug)
  const globalSlugs = cfg.globals.map((g) => g.slug)

  const manifest = {
    exportedAt: new Date().toISOString(),
    globals: {},
    collections: {},
    media: { downloaded: 0, skipped: 0, failed: 0, failures: [] },
  }

  // 1) GLOBALS -------------------------------------------------------------
  log(`\n── Globals (${globalSlugs.length}) ──`)
  for (const slug of globalSlugs) {
    try {
      const doc = await payload.findGlobal({ slug, depth: 1 })
      await writeJson(path.join(CONTENT_DIR, 'globals', `${slug}.json`), doc)
      manifest.globals[slug] = 'ok'
      log(`  ✓ ${slug}`)
    } catch (err) {
      manifest.globals[slug] = `error: ${err.message}`
      log(`  ✗ ${slug}: ${err.message}`)
    }
  }

  // 2) COLLECTIONS ---------------------------------------------------------
  log(`\n── Collections (${collectionSlugs.length}) ──`)
  const collectionDocs = {}
  for (const slug of collectionSlugs) {
    try {
      const { docs } = await payload.find({ collection: slug, depth: 1, limit: 0, pagination: false })
      collectionDocs[slug] = docs
      await writeJson(path.join(CONTENT_DIR, 'collections', `${slug}.json`), docs)
      manifest.collections[slug] = docs.length
      log(`  ✓ ${slug}: ${docs.length} docs`)
    } catch (err) {
      manifest.collections[slug] = `error: ${err.message}`
      log(`  ✗ ${slug}: ${err.message}`)
    }
  }

  // 3) MEDIA FILES ---------------------------------------------------------
  log(`\n── Media files → public/uploads/ ──`)
  for (const slug of MEDIA_COLLECTIONS) {
    const docs = collectionDocs[slug]
    if (!docs?.length) continue
    for (const doc of docs) {
      const filename = doc.filename || (doc.url ? path.basename(new URL(doc.url).pathname) : null)
      if (!doc.url || !filename) {
        manifest.media.skipped++
        continue
      }
      const dest = path.join(UPLOADS_DIR, slug, filename)
      try {
        const r = await downloadTo(doc.url, dest)
        if (r.ok) {
          manifest.media.downloaded++
          log(`  ✓ ${slug}/${filename}`)
        } else if (r.skipped) {
          manifest.media.skipped++
        } else {
          manifest.media.failed++
          manifest.media.failures.push({ slug, filename, error: r.error })
          log(`  ✗ ${slug}/${filename}: ${r.error}`)
        }
      } catch (err) {
        manifest.media.failed++
        manifest.media.failures.push({ slug, filename, error: err.message })
        log(`  ✗ ${slug}/${filename}: ${err.message}`)
      }
    }
  }

  // 4) MANIFEST ------------------------------------------------------------
  await writeJson(path.join(CONTENT_DIR, '_export-manifest.json'), manifest)

  const totalDocs = Object.values(manifest.collections)
    .filter((v) => typeof v === 'number')
    .reduce((a, b) => a + b, 0)
  log(
    `\n✅ Export complete.\n` +
      `   Globals: ${globalSlugs.length} · Collection docs: ${totalDocs}\n` +
      `   Media: ${manifest.media.downloaded} downloaded, ${manifest.media.skipped} skipped, ${manifest.media.failed} failed\n` +
      `   See content/_export-manifest.json for details.`,
  )

  // payload keeps the pg pool open; exit explicitly.
  process.exit(0)
}

main().catch((err) => {
  console.error('Export failed:', err)
  process.exit(1)
})

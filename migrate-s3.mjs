// S3 Migration Script: Old Supabase Storage → New Supabase Storage
//
// Credentials are read from the environment — NEVER hardcode them here.
// Put them in a git-ignored `migrate.env` (see .env.example) and run:
//   node --env-file=migrate.env migrate-s3.mjs
//
// Non-ASCII handling:
//   Files uploaded before the sanitizeFilename fix (e.g. Thai filenames such as
//   "ณัฐณัฐ.webp") have S3 keys that browsers fail to load. This script copies
//   each object to a SANITIZED key in the new bucket and writes a mapping of
//   { oldKey -> newKey } to `s3-key-remap.json`. Use that mapping to update the
//   `filename` / `url` columns of the corresponding media rows in the database
//   so the renamed objects line up with what the CMS serves.

import { writeFileSync } from 'fs'
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'

function requireEnv(name) {
  const v = process.env[name]
  if (!v) {
    console.error(
      `Missing ${name}. Set old/new S3 credentials in migrate.env (see .env.example) and run:\n` +
        '  node --env-file=migrate.env migrate-s3.mjs',
    )
    process.exit(1)
  }
  return v
}

const OLD_S3 = {
  region: requireEnv('OLD_S3_REGION'),
  endpoint: requireEnv('OLD_S3_ENDPOINT'),
  credentials: {
    accessKeyId: requireEnv('OLD_S3_ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('OLD_S3_SECRET_ACCESS_KEY'),
  },
  forcePathStyle: true,
}

const NEW_S3 = {
  region: requireEnv('NEW_S3_REGION'),
  endpoint: requireEnv('NEW_S3_ENDPOINT'),
  credentials: {
    accessKeyId: requireEnv('NEW_S3_ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('NEW_S3_SECRET_ACCESS_KEY'),
  },
  forcePathStyle: true,
}

const BUCKET = process.env.S3_BUCKET || 'payload-media'

const oldClient = new S3Client(OLD_S3)
const newClient = new S3Client(NEW_S3)

/**
 * Sanitize a single filename (no directory part) for S3 compatibility.
 * Mirrors src/utils/sanitizeFilename.ts so migrated keys match what new
 * uploads would produce.
 */
function sanitizeFilename(original) {
  const lastDot = original.lastIndexOf('.')
  const ext = lastDot !== -1 ? original.slice(lastDot + 1) : ''
  const base = lastDot !== -1 ? original.slice(0, lastDot) : original

  const clean = base
    .replace(/[^\x20-\x7E]/g, '') // remove non-ASCII (e.g. Thai chars)
    .replace(/[^\w\s.-]/g, '') // keep word chars, spaces, dots, hyphens
    .replace(/\s+/g, '-') // spaces to hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
    .trim()

  const safeName = clean || `file-${Date.now()}`
  return ext ? `${safeName}.${ext}` : safeName
}

/**
 * Sanitize an S3 key while preserving its directory prefix (e.g.
 * "hero-media/ณัฐ.webp" -> "hero-media/file-...webp"). Guarantees the
 * sanitized basename is unique within this run to avoid collisions.
 */
const usedKeys = new Set()
function sanitizeKey(key) {
  const slash = key.lastIndexOf('/')
  const dir = slash !== -1 ? key.slice(0, slash + 1) : ''
  const name = slash !== -1 ? key.slice(slash + 1) : key

  let safe = sanitizeFilename(name)
  let candidate = dir + safe
  if (usedKeys.has(candidate)) {
    const dot = safe.lastIndexOf('.')
    const ext = dot !== -1 ? safe.slice(dot) : ''
    const stem = dot !== -1 ? safe.slice(0, dot) : safe
    let n = 2
    do {
      candidate = `${dir}${stem}-${n}${ext}`
      n++
    } while (usedKeys.has(candidate))
  }
  usedKeys.add(candidate)
  return candidate
}

async function listAllObjects() {
  const objects = []
  let continuationToken = undefined

  do {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET,
      ContinuationToken: continuationToken,
    })
    const response = await oldClient.send(command)
    if (response.Contents) {
      objects.push(...response.Contents)
    }
    continuationToken = response.NextContinuationToken
  } while (continuationToken)

  return objects
}

async function migrate() {
  console.log('Listing files in old bucket...')
  const objects = await listAllObjects()
  console.log(`Found ${objects.length} files to migrate\n`)

  let success = 0
  let failed = 0
  let renamed = 0
  const remap = []

  for (const obj of objects) {
    const oldKey = obj.Key
    const newKey = sanitizeKey(oldKey)
    try {
      // Download from old
      const getCmd = new GetObjectCommand({ Bucket: BUCKET, Key: oldKey })
      const response = await oldClient.send(getCmd)

      // Collect stream
      const chunks = []
      for await (const chunk of response.Body) {
        chunks.push(chunk)
      }
      const buffer = Buffer.concat(chunks)

      // Upload to new (under sanitized key)
      const putCmd = new PutObjectCommand({
        Bucket: BUCKET,
        Key: newKey,
        Body: buffer,
        ContentType: response.ContentType,
      })
      await newClient.send(putCmd)

      if (newKey !== oldKey) {
        renamed++
        remap.push({ oldKey, newKey })
        console.log(`  ✓ ${oldKey}  →  ${newKey}  (renamed)`)
      } else {
        console.log(`  ✓ ${oldKey}`)
      }
      success++
    } catch (err) {
      console.log(`  ✗ ${oldKey}: ${err.message}`)
      failed++
    }
  }

  writeFileSync('s3-key-remap.json', JSON.stringify(remap, null, 2))

  console.log(`\n✅ Done! Success: ${success}, Failed: ${failed}, Renamed: ${renamed}`)
  if (renamed > 0) {
    console.log(
      `\n⚠️  ${renamed} file(s) were renamed to remove non-ASCII characters.\n` +
        '   Mapping written to s3-key-remap.json. Update the matching media rows\n' +
        "   (filename / url columns) in the database so the CMS points at the new keys.",
    )
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})

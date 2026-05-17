// S3 Migration Script: Old Supabase Storage → New Supabase Storage
// Run: node migrate-s3.mjs

import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'

const OLD_S3 = {
  region: 'ap-southeast-2',
  endpoint: 'https://paupqfrkgubdjeuviaww.storage.supabase.co/storage/v1/s3',
  credentials: {
    accessKeyId: '46dfa2f3f2d5ddd9a9798b405b285837',
    secretAccessKey: '95e913ad960b32528e7474414a176149dfff7eb56f6cdd45fcba1282e417bac7',
  },
  forcePathStyle: true,
}

const NEW_S3 = {
  region: 'ap-southeast-1',
  endpoint: 'https://fgmfxguonnqmfcoadrrj.storage.supabase.co/storage/v1/s3',
  credentials: {
    accessKeyId: '1b0bace94d8c7341843cc7fc9a0a63b9',
    secretAccessKey: '5e3cc25d8d20791a8b8b62b9edcfc543c2000205237026bec1f06613d4c9b263',
  },
  forcePathStyle: true,
}

const BUCKET = 'payload-media'

const oldClient = new S3Client(OLD_S3)
const newClient = new S3Client(NEW_S3)

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

  for (const obj of objects) {
    try {
      // Download from old
      const getCmd = new GetObjectCommand({ Bucket: BUCKET, Key: obj.Key })
      const response = await oldClient.send(getCmd)

      // Collect stream
      const chunks = []
      for await (const chunk of response.Body) {
        chunks.push(chunk)
      }
      const buffer = Buffer.concat(chunks)

      // Upload to new
      const putCmd = new PutObjectCommand({
        Bucket: BUCKET,
        Key: obj.Key,
        Body: buffer,
        ContentType: response.ContentType,
      })
      await newClient.send(putCmd)

      console.log(`  ✓ ${obj.Key}`)
      success++
    } catch (err) {
      console.log(`  ✗ ${obj.Key}: ${err.message}`)
      failed++
    }
  }

  console.log(`\n✅ Done! Success: ${success}, Failed: ${failed}`)
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})

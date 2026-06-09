// DB Migration Script: Old Supabase → New Supabase
//
// Credentials are read from the environment — NEVER hardcode them here.
// Put them in a git-ignored `migrate.env` (see .env.example) and run:
//   node --env-file=migrate.env migrate-db.mjs

import pg from 'pg'
const { Client } = pg

const OLD_DB = process.env.OLD_DATABASE_URI
const NEW_DB = process.env.NEW_DATABASE_URI

if (!OLD_DB || !NEW_DB) {
  console.error(
    'Missing OLD_DATABASE_URI and/or NEW_DATABASE_URI.\n' +
      'Set them in migrate.env and run: node --env-file=migrate.env migrate-db.mjs',
  )
  process.exit(1)
}

// Insert order: parents before children (respects FK constraints)
const TABLE_ORDER = [
  // Media (no deps)
  'users',
  'gallery_media',
  'hero_media',
  'service_media',
  'partner_media',
  // Globals & standalone
  'about',
  'contact',
  'contact_hero',
  'faq',
  'founders',
  'home',
  'privacy_policy',
  'terms_of_service',
  'payment_settings',
  // Collections
  'payment_slips',
  'orders',
  'portfolio_articles',
  'portfolio_hero',
  'products',
  'products_hero',
  'quote_requests',
  'services',
  'services_hero',
  'services_sections',
  // Payload internals
  'payload_migrations',
  'payload_kv',
  'payload_locked_documents',
  'payload_preferences',
  // Children / junction tables
  'users_sessions',
  'about_hero',
  'about_history_highlights',
  'about_youtube_videos',
  'about_hero_rels',
  'contact_hero_rels',
  'faq_faq_items',
  'founders_rels',
  'home_rels',
  'orders_line_items',
  'portfolio_articles_rels',
  'portfolio_hero_rels',
  'products_hero_rels',
  'quote_requests_line_items',
  'services_hero_rels',
  'services_sections_images',
  'services_tags',
  'email_tests',
  'payload_locked_documents_rels',
  'payload_preferences_rels',
]

const oldClient = new Client({ connectionString: OLD_DB })
const newClient = new Client({ connectionString: NEW_DB })

async function migrate() {
  console.log('Connecting to databases...')
  await oldClient.connect()
  console.log('✓ Connected to OLD database')
  await newClient.connect()
  console.log('✓ Connected to NEW database')

  // Step 1: Truncate all tables in new DB (reverse order)
  console.log('\n--- Clearing new DB (reverse order) ---')
  const reverseOrder = [...TABLE_ORDER].reverse()
  for (const table of reverseOrder) {
    try {
      await newClient.query(`DELETE FROM payload."${table}"`)
    } catch (e) {
      // ignore if table doesn't exist or already empty
    }
  }
  console.log('✓ Cleared')

  // Step 2: Copy data in correct order
  console.log('\n--- Copying data ---')
  let totalRows = 0

  for (const table of TABLE_ORDER) {
    try {
      const { rows } = await oldClient.query(`SELECT * FROM payload."${table}"`)

      if (rows.length === 0) {
        console.log(`  - ${table}: empty`)
        continue
      }

      const columns = Object.keys(rows[0])
      const colList = columns.map((c) => `"${c}"`).join(', ')

      for (const row of rows) {
        const values = columns.map((_, i) => `$${i + 1}`)
        const vals = columns.map((c) => row[c])
        await newClient.query(
          `INSERT INTO payload."${table}" (${colList}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING`,
          vals,
        )
      }

      console.log(`  ✓ ${table}: ${rows.length} rows`)
      totalRows += rows.length
    } catch (err) {
      console.log(`  ✗ ${table}: ${err.message}`)
    }
  }

  console.log(`\n✅ Migration complete! Total rows copied: ${totalRows}`)
  await oldClient.end()
  await newClient.end()
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})

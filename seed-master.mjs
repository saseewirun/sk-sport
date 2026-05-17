/**
 * seed-master.mjs
 * รันครั้งเดียวเพื่อ: (1) สร้าง column role ใน DB, (2) set user เดิมเป็น master
 * คำสั่ง: node seed-master.mjs
 */

import pg from 'pg'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import readline from 'readline'

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env')
  if (!existsSync(envPath)) {
    console.error('❌  ไม่พบไฟล์ .env')
    process.exit(1)
  }
  const lines = readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const val = trimmed
      .slice(idx + 1)
      .trim()
      .replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
}

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

async function main() {
  loadEnv()

  const dbUri = process.env.DATABASE_URI
  if (!dbUri) {
    console.error('❌  ไม่พบ DATABASE_URI ใน .env')
    process.exit(1)
  }

  const client = new pg.Client({ connectionString: dbUri })
  await client.connect()
  console.log('✅  เชื่อมต่อ database สำเร็จ')

  // Step 1: สร้าง column role ถ้ายังไม่มี (safe — ไม่ error ถ้ามีแล้ว)
  await client.query(`
    ALTER TABLE payload.users
    ADD COLUMN IF NOT EXISTS role text DEFAULT 'editor'
  `)
  console.log("✅  column 'role' พร้อมใช้งานแล้ว")

  // Step 2: ดึงรายชื่อ users
  const { rows: users } = await client.query(
    `SELECT id, email, role FROM payload.users ORDER BY "created_at" ASC`,
  )

  if (users.length === 0) {
    console.log('⚠️  ไม่พบ user กรุณาสร้าง admin ก่อน')
    await client.end()
    process.exit(0)
  }

  console.log('\n📋  รายชื่อ user ที่มีอยู่:')
  users.forEach((u, i) => {
    console.log(`  ${i + 1}. ${u.email}  (role: ${u.role ?? 'null'})`)
  })

  const answer = await ask('\nset role = master ให้ users ทั้งหมดนี้? (y/n): ')
  if (answer.toLowerCase() !== 'y') {
    console.log('❌  ยกเลิก')
    await client.end()
    process.exit(0)
  }

  await client.query(
    `UPDATE payload.users SET role = 'master' WHERE role IS NULL OR role = '' OR role = 'editor'`,
  )

  const { rows: updated } = await client.query(
    `SELECT email, role FROM payload.users ORDER BY "created_at" ASC`,
  )
  console.log('\n✅  อัปเดตสำเร็จ:')
  updated.forEach((u) => console.log(`  •  ${u.email}  →  ${u.role}`))
  console.log('\n🎉  เสร็จ! รัน node seed-master.mjs สำเร็จแล้ว')

  await client.end()
}

main().catch((err) => {
  console.error('❌  Error:', err.message)
  process.exit(1)
})

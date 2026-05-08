/**
 * seed-master.mjs
 *
 * รันครั้งเดียวหลัง Vercel deploy เสร็จ เพื่อ set user ปัจจุบันเป็น master
 * คำสั่ง: node seed-master.mjs
 *
 * ⚠️  ต้องมีไฟล์ .env ในโฟลเดอร์เดียวกัน และมี DATABASE_URI
 * ⚠️  ต้องรอให้ Vercel deploy เสร็จก่อน (เพื่อให้คอลัมน์ role ถูกสร้าง)
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

  // ตรวจสอบว่าคอลัมน์ role มีแล้วหรือยัง
  const { rows: cols } = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'payload' AND table_name = 'users' AND column_name = 'role'
  `)

  if (cols.length === 0) {
    console.error('❌  คอลัมน์ "role" ยังไม่มีใน database')
    console.error('    กรุณารอให้ Vercel deploy เสร็จก่อน แล้วรัน script นี้ใหม่')
    await client.end()
    process.exit(1)
  }

  // ดึงรายชื่อ users ทั้งหมด (ไม่ select role เพื่อ safety)
  const { rows: users } = await client.query(
    `SELECT id, email, role FROM payload.users ORDER BY "createdAt" ASC`,
  )

  if (users.length === 0) {
    console.log('⚠️  ไม่พบ user ในระบบ กรุณาสร้าง admin account ก่อนผ่าน Payload CMS')
    await client.end()
    process.exit(0)
  }

  console.log('\n📋  รายชื่อ user ที่มีอยู่:')
  users.forEach((u, i) => {
    console.log(`  ${i + 1}. ${u.email}  (role ปัจจุบัน: ${u.role ?? 'ยังไม่กำหนด'})`)
  })

  console.log('\n')
  const answer = await ask(
    'ต้องการ set role = master ให้ user ทั้งหมดด้านบน (เหมาะสำหรับครั้งแรก)? (y/n): ',
  )

  if (answer.toLowerCase() !== 'y') {
    console.log('❌  ยกเลิกแล้ว')
    await client.end()
    process.exit(0)
  }

  await client.query(`UPDATE payload.users SET role = 'master' WHERE role IS NULL OR role = ''`)

  const { rows: updated } = await client.query(
    `SELECT email, role FROM payload.users ORDER BY "createdAt" ASC`,
  )

  console.log('\n✅  อัปเดตสำเร็จ:')
  updated.forEach((u) => console.log(`  •  ${u.email}  →  role: ${u.role}`))
  console.log('\n🎉  เสร็จแล้ว! ผู้ใช้ใหม่ที่เพิ่มผ่าน CMS จะได้ role = editor โดยอัตโนมัติ')

  await client.end()
}

main().catch((err) => {
  console.error('❌  เกิดข้อผิดพลาด:', err.message)
  process.exit(1)
})

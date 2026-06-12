/**
 * scripts/admin-screenshots.mjs — capture admin UI screenshots for the
 * customer manual (docs/ADMIN-GUIDE.md). Run with both dev servers up:
 *   npm run dev          (next, port 3000)
 *   npm run admin:dev    (admin API, port 8788)
 *   node scripts/admin-screenshots.mjs
 *
 * Also acts as an end-to-end smoke test: it fails when login breaks or any
 * admin page does not render its first section card with real data.
 */

import { chromium } from 'playwright'
import { mkdir } from 'fs/promises'

const BASE = 'http://localhost:3000'
const PASSWORD = process.env.ADMIN_PASSWORD || 'sksport-dev'
const OUT = 'docs/images/admin'

/** [file, path, selector that proves real data rendered] */
const PAGES = [
  ['home', '/admin/home', 'text=รูปแบนเนอร์ใหญ่ (Hero)'],
  ['about', '/admin/about', 'text=ทีมงาน (Team Member)'],
  ['services', '/admin/services', 'text=รายการบริการ'],
  ['products', '/admin/products', 'text=+ เพิ่มสินค้าใหม่'],
  ['portfolio', '/admin/portfolio', 'text=รายการบทความผลงาน'],
  ['contact', '/admin/contact', 'text=แผนที่ Google Map'],
  ['faq', '/admin/faq', 'text=รายการคำถาม-คำตอบ'],
  ['policies', '/admin/policies', 'text=นโยบายความเป็นส่วนตัว'],
  ['orders', '/admin/orders', 'text=รายการสั่งซื้อและคำขอใบเสนอราคา'],
  ['payment', '/admin/payment', 'text=การชำระเงินด้วยการโอน'],
]

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

// login page screenshot + actual login
await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' })
await page.waitForSelector('input[type=password]')
await page.screenshot({ path: `${OUT}/login.png` })
// type after hydration so React's onChange enables the submit button
await page.waitForTimeout(1500)
await page.click('input[type=password]')
await page.keyboard.type(PASSWORD, { delay: 25 })
await page.click('button[type=submit]')
await page.waitForURL('**/admin/home', { timeout: 15000 })
console.log('✓ login')

for (const [name, path, proof] of PAGES) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
  await page.waitForSelector(proof, { timeout: 20000 })
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log(`✓ ${path}`)
}

await browser.close()
console.log(`\nDone — screenshots in ${OUT}/`)

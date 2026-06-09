# SK-Sport — Static-first on Vercel (Architecture & Deploy Guide)

เว็บ SK-Sport ถูกปรับจาก **SSR-dynamic บน DigitalOcean Droplet** → **static-first (SSG/ISR) บน Vercel**
โดยยังคง Payload CMS ให้ลูกค้าแก้ content/รูปได้ และเลิกใช้ DigitalOcean

---

## 1) สถาปัตยกรรมใหม่

```
Public website  → Next.js App Router, prerender (SSG) + ISR
                  • หน้า list/detail ทั้งหมด prerender ตอน build
                  • ดึง content จาก Payload (Supabase Postgres) ตอน build
                  • รูปเสิร์ฟตรงจาก Supabase S3 storage
Payload CMS     → /admin + /api เป็น Vercel Serverless (Node runtime)
Supabase        → Postgres (DB ของ Payload) + S3 (media) เท่านั้น
Keepalive       → GitHub Actions ping /api/health ทุก ~5 วัน
ภาษา            → ไทยล้วน (ไม่มี /en /th, ไม่มี cookie/switcher)
```

## 2) สิ่งที่เปลี่ยน (สรุป)

| ด้าน               | เดิม                                                    | ใหม่                                                                |
| ------------------ | ------------------------------------------------------- | ------------------------------------------------------------------- |
| Render หน้า public | SSR-dynamic ทุก request (เพราะ i18n อ่าน cookie/header) | **SSG + ISR** (`revalidate = 3600`) + on-demand revalidate          |
| i18n               | 2 ภาษา (en/th) ตรวจจาก cookie/header                    | **ไทยล้วน** locale คงที่ `th`, ไม่อ่าน cookie/header                |
| หน้า `[slug]`      | render on-demand (ไม่มี generateStaticParams)           | **prerender ด้วย `generateStaticParams`** + ISR fallback            |
| Content update     | —                                                       | Payload `afterChange/afterDelete` → `revalidatePath('/', 'layout')` |
| Supabase client    | `@supabase/supabase-js` (dead code)                     | **ลบทิ้ง** + ตัด env ที่ไม่ใช้                                      |
| Keepalive          | —                                                       | `/api/health` + `.github/workflows/keepalive.yml`                   |
| Deploy             | DigitalOcean Droplet (Docker)                           | **Vercel**                                                          |

## 3) ไฟล์ที่แก้/เพิ่ม

- `src/i18n/config.ts`, `src/i18n/request.ts` — ไทยล้วน, ตัด cookies()/headers()
- `src/app/(frontend)/layout.tsx`, `service/page.tsx` — `setRequestLocale('th')` เปิด static
- `src/app/(frontend)/page.tsx` — ตัด `force-dynamic` → `revalidate`
- หน้า content ทั้งหมด — เพิ่ม `export const revalidate = 3600`
- หน้า `[slug]` (portfolio/product/service/founders) — เพิ่ม `generateStaticParams`
- `src/payload/hooks/revalidate.ts` (ใหม่) + ต่อเข้า Founders/Products/Services/PortfolioArticles + globals Home/About
- `src/app/api/health/route.ts` (ใหม่) — keepalive endpoint
- `.github/workflows/keepalive.yml` (ใหม่)
- ลบ `src/lib/supabase.ts` และ `src/messages/en/*`

## 4) วิธี deploy บน Vercel (ของลูกค้า)

1. Import repo เข้า Vercel → Framework: **Next.js** (auto), Build: `next build` (default), Output: (default)
2. ตั้ง **Environment Variables (Production)** — ดูข้อ 5
3. Deploy — build จะ **prerender หน้า public** (ต้องต่อ Supabase ได้ตอน build → Supabase ต้อง active)
4. ผูกโดเมน `sksporttrading.com` + `www` (ดู `docs/DEPLOYMENT-MIGRATION.md` เรื่อง DNS)

> Vercel Hobby (free): serverless function จำกัด ~10s/req — การอัปโหลดรูปใหญ่ใน admin
> (มีบีบอัด webp ด้วย sharp) อาจชนลิมิตได้ ถ้าเจอให้ลดขนาดรูปก่อนอัป หรือพิจารณาอัปเกรด plan

## 5) Environment variables (ตั้งใน Vercel Dashboard)

จำเป็น: `DATABASE_URI`, `PAYLOAD_SECRET`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`,
`S3_REGION`, `S3_ENDPOINT`, `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_FROM_NAME`, `NEXT_PUBLIC_SERVER_URL`

ไม่ต้องใช้แล้ว: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

GitHub repo secret (สำหรับ keepalive): `KEEPALIVE_URL` = `https://sksporttrading.com/api/health`

ค่าเต็มดู `.env.example`

## 6) วิธีทดสอบ

**Public website**

- `npm run build` แล้วดู log: หน้า public ควรขึ้นสัญลักษณ์ `○ (Static)` / `● (SSG)` ไม่ใช่ `ƒ (Dynamic)`
- เปิดหน้า `/`, `/about`, `/product`, `/service`, `/portfolio`, detail `[slug]` → ต้องโหลด+รูปขึ้นครบ

**Payload Admin**

- เข้า `/admin` → login → แก้ข้อความ/อัปรูปใน Founders/Products/ฯลฯ แล้ว Save
- กลับมาดูหน้า public ที่เกี่ยว → content อัปเดต (on-demand revalidate ภายในไม่กี่วินาที; ถ้าหน้าไม่อยู่ใน hook จะอัปเดตภายใน 1 ชม. ตาม ISR)

**Supabase keepalive**

- เปิด `https://<domain>/api/health` → ต้องได้ `{"ok":true,"db":"up",...}`
- ที่ GitHub → Actions → "Supabase keepalive" → Run workflow (manual) → ต้องเขียว

## 7) ความเสี่ยง/ข้อควรรู้ที่เหลือ

1. **Build ต้องต่อ Supabase ได้** — ถ้า Supabase ถูก pause ตอน deploy, prerender จะ fail (keepalive ช่วยกันได้ระดับหนึ่ง)
2. **`push: true`** ใน `payload.config.ts` ยังเปิดอยู่ — Payload จะ auto-sync schema; ระยะยาวควรเปลี่ยนเป็น migration-based (เป็นงานแยก ต้อง approve ก่อนเพราะแตะ schema)
3. **Vercel Hobby limits** — function timeout/cron/bandwidth; upload รูปใหญ่อาจชน 10s
4. on-demand revalidate ต่อไว้เฉพาะ collection/global หลัก ที่เหลือใช้ ISR 1 ชม.
5. DNS `www` ยังต้องชี้ Vercel (ดู `docs/DEPLOYMENT-MIGRATION.md`)
6. Dockerfile/docker-compose (ของ droplet เดิม) ยังอยู่ใน repo — Vercel ไม่ใช้ ลบทีหลังได้

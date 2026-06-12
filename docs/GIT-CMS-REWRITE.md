# SK-Sport — Git-based CMS Rewrite (no database) — Plan & Status

เป้าหมาย: ตัด database/server ออกถาวร ลูกค้าไม่ต้องจ่ายค่า DB — เว็บเป็น static
แก้ content ผ่าน **custom admin (เขียนเอง) + GitHub API**, ประวัติออเดอร์/สลิปเก็บเป็น
**ไฟล์ใน GitHub repo**, hosting ย้ายไป **Cloudflare Pages**

> Branch: `claude/sk-sport-git-cms` (แยกจาก `main`) — **PR #37 (static-first บน Vercel)
> ยังเป็น fallback ที่ทำงานได้ ฿0 อยู่** ถ้า rewrite นี้ยังไม่จบ ให้ merge #37 ไปก่อนได้

---

## สถาปัตยกรรมเป้าหมาย

```
Content (ข้อความ/รูป/ขนาดฟอนต์)  → ไฟล์ JSON ใน content/ + รูปใน public/uploads/
Public website                  → Next.js static export (output: 'export')
Admin (/admin)                  → custom UI เขียนเอง → Save = commit ผ่าน GitHub API
ประวัติออเดอร์ + สลิป           → ไฟล์ JSON + รูป commit เข้า repo (โฟลเดอร์ orders/)
Hosting                         → Cloudflare Pages (ฟรี) + R2 ถ้ารูปเยอะ
Database / Supabase             → ❌ ตัดทิ้งถาวร (ไม่มี keepalive อีกต่อไป)
```

ทำไมแบบนี้ตอบโจทย์: ไม่มี DB ให้ pause/จ่ายเงิน, ทุกอย่างเป็นไฟล์ใน git (เวอร์ชันครบ
ย้อนได้), ข้อมูลลูกค้าอยู่ในมือลูกค้า 100%

---

## ⚠️ เงื่อนไขลูกค้า ↔ วิธีรับประกัน

| เงื่อนไข                             | วิธีทำให้สำเร็จ                                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| 1. ทุกหน้าต้องอยู่ครบ                | ใช้ component/หน้าตา UI เดิมทั้งหมด เปลี่ยนแค่ "แหล่งข้อมูล" จาก Payload → ไฟล์                  |
| 2. Admin แก้รูป/ข้อความ/ขนาดฟอนต์ได้ | custom admin map ทุก field เดิม (รวม `*FontSize`) → เขียนกลับเป็นไฟล์ผ่าน GitHub API             |
| 3. ประวัติออเดอร์ไม่ต้องใช้ DB       | serverless function (Cloudflare) รับฟอร์ม → commit `orders/<id>.json` + สลิปเข้า repo + ส่งอีเมล |
| 4. ข้อมูลเดิมห้ามหาย                 | **`scripts/export-from-payload.mjs`** ดึงทุกอย่างออกจาก Supabase เป็นไฟล์ก่อน (ทำแล้ว ↓)         |
| 5. UI เหมือนเดิม                     | ไม่แตะ component หน้าตา/CSS/Tailwind — แก้เฉพาะ data layer                                       |

---

## ✅ ทำเสร็จแล้ว (commit บน branch นี้)

### 0. File-based content layer — **ทำงานแล้ว build ผ่านโดยไม่มี DB** ✓

- `src/lib/contentStore.ts` — ตัวอ่าน `content/*.json` + แปลง media URL เป็น `/uploads/...` อัตโนมัติ
- `src/data/*` ทั้ง 16 functions ถูก re-implement ให้อ่านไฟล์แทน Payload **โดย signature เดิมเป๊ะ**
  → ทุกหน้า UI ไม่ถูกแตะแม้แต่บรรทัดเดียว (เงื่อนไข "UI เหมือนเดิม")
- `scripts/generate-sample-content.mjs` — สร้าง content ตัวอย่างตรง schema (ใช้พัฒนา/ทดสอบ
  ระหว่างรอข้อมูลจริง; ข้อมูลจริงจาก export จะเขียนทับ)
- **ยืนยันแล้ว: `next build` ผ่านเต็มรูปแบบโดยไม่มี database** — public ทุกหน้าเป็น
  Static/SSG (36 หน้า prerender), เหลือ dynamic แค่ /admin + /api ของ Payload เดิม
- Payload ยังอยู่ในโปรเจกต์ชั่วคราว (เพื่อให้ export script รันได้ + /admin เดิมใช้ได้เมื่อมี DB)
  จะถอดออกในขั้นตอนท้ายหลัง custom admin เสร็จ

### 1. `scripts/export-from-payload.mjs` — ตัวกันข้อมูลหาย (เสาหลัก)

อ่านอย่างเดียว (ไม่แตะ Supabase) → ดึงออกมาเป็นไฟล์:

- ทุก **global** → `content/globals/<slug>.json`
- ทุก **collection** → `content/collections/<slug>.json` (เอกสารเต็ม)
- ทุก **media** → ดาวน์โหลดลง `public/uploads/<prefix>/<filename>`
- manifest สรุปจำนวน → `content/_export-manifest.json`

**วิธีรัน (ฝั่งที่มีค่า Supabase จริง):**

```bash
cp .env.example .env          # ใส่ DATABASE_URI / PAYLOAD_SECRET / S3_* จริง
npx payload run scripts/export-from-payload.mjs
```

> รันซ้ำได้ ปลอดภัย — ไม่ลบ ไม่เขียนอะไรกลับเข้า DB/S3

---

## ⏳ ยังไม่เสร็จ — เหลือทำ (ต้องมี "ข้อมูล export แล้ว" ก่อนถึงจะ verify ได้)

> ก้อง verify ส่วนล่างนี้ไม่ได้ใน sandbox เพราะ (ก) ไม่มีข้อมูลลูกค้าจริง
> (ข) network บล็อก DB/Google Fonts จึง build เต็มไม่ได้ที่นี่ — ต้องทำต่อตอนมีข้อมูล

1. **รัน export** ด้วยข้อมูลจริง → ได้ `content/*` + `public/uploads/*` (ขั้น 0 ของทุกอย่าง)
2. **File-based content layer** — เขียน `src/content/` แทน `src/data/*` (เดิมเรียก getPayload)
   ให้อ่านจากไฟล์ JSON ที่ export มา; เก็บ type จาก `payload-types.ts` ไว้ใช้ต่อได้
3. **ปรับหน้า public** ทุกหน้า ให้เรียก loader ใหม่แทน Payload (UI เดิม ไม่แตะ)
   - `output: 'export'` ใน next.config + `generateStaticParams` ทุก `[slug]`
4. **Custom admin** ที่ `/admin` (เขียนเอง):
   - หน้า login (GitHub OAuth / fine-grained PAT)
   - ฟอร์มแก้ทุก collection/global ตาม schema เดิม (รวมช่องขนาดฟอนต์)
   - อัปรูป + Save → commit ผ่าน GitHub Contents API → Cloudflare rebuild อัตโนมัติ
5. **ระบบออเดอร์แบบไฟล์** — Cloudflare Pages Function:
   - `POST /api/checkout` & `/api/quote` → เขียน `orders/YYYY/<id>.json` + สลิป + ส่งอีเมล (Resend)
   - หน้า admin ดูประวัติออเดอร์ (อ่านไฟล์ `orders/`)
6. **Cloudflare Pages setup** — build command, R2 (ถ้าใช้), env, custom domain
   - ส่ง ticket แก้ DNS apex→Cloudflare (รวมกับงาน remote ครั้งเดียว)
7. ทดสอบครบ (public, admin แก้/บันทึก, ออเดอร์) → ค่อยปิด Supabase

---

## ลำดับที่ปลอดภัย (กันข้อมูลหาย เป็นข้อ 0 เสมอ)

1. **export ข้อมูลจริง + commit** `content/` + `public/uploads/` ← จุดที่ข้อมูลถูก "ล็อก" ไว้ในมือเรา
2. ค่อยทำ content layer → หน้า public → admin → orders
3. Supabase **ห้ามแตะ/ปิด** จนกว่าจะ verify เว็บใหม่ครบ

---

## ความจริงเรื่องเวลา

งานนี้เป็น rewrite หลาย session ไม่ใช่ครึ่งวัน ส่วนที่ "ทำได้โดยไม่ต้องรอข้อมูล" คือ
export script (เสร็จแล้ว) + แผนนี้ ส่วนที่เหลือต้องเริ่มเมื่อมีไฟล์ export จริง เพื่อไม่ให้
เดา schema ผิดแล้วกระทบเงื่อนไข "UI เหมือนเดิม / ข้อมูลครบ"

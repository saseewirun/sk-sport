# SK-Sport — คู่มือแก้ปัญหา Production & ย้าย Supabase

เอกสารนี้สรุปสาเหตุของอาการที่ลูกค้าแจ้ง และ **checklist ที่ต้องทำเองใน Vercel / Supabase Dashboard**
(งานเหล่านี้แก้ในโค้ดไม่ได้ ต้องตั้งค่าใน dashboard)

---

## 1. สรุปอาการ ↔ สาเหตุ

| อาการที่ลูกค้าแจ้ง | สาเหตุที่พบ |
|---|---|
| **เว็บเข้าอันเดิม / แก้แล้วไม่ขึ้น** | env บน production (`DATABASE_URI`) ยังชี้ไป Supabase **โปรเจกต์เก่า** `paupqfrkgubdjeuviaww` แทนที่จะเป็นตัวที่ใช้งานจริง |
| **เข้าหน้า Admin ไม่ได้** | หน้า `/admin` ต้องต่อฐานข้อมูล ถ้าโปรเจกต์เก่าถูก Supabase **pause** (โดนพักเพราะไม่มีการใช้งาน) Payload จะต่อ DB ไม่ได้ หน้า Admin ล่ม |
| **รูปคุณ Nattanat ไม่ขึ้น** | `S3_ENDPOINT` ชี้ storage โปรเจกต์เก่า + ไฟล์รูปที่อัปโหลด **ก่อน** เพิ่ม `sanitizeFilename` (17 พ.ค. 2026) ที่มีชื่อไฟล์ภาษาไทย จะมี S3 key เพี้ยน เบราว์เซอร์โหลดไม่ติด และตอน migrate รอบก่อนก็คัดลอกไม่สำเร็จ |

**Root cause เดียวที่อธิบายทั้ง 3 อาการ:** production ยังผูกกับ Supabase โปรเจกต์เก่า ในขณะที่ข้อมูลถูกย้ายไปโปรเจกต์ใหม่ (`fgmfxguonnqmfcoadrrj`) ตามสคริปต์ `migrate-db.mjs` / `migrate-s3.mjs` แล้ว แต่ยังไม่ได้สลับ env

> Supabase ในโปรเจกต์: เก่า `paupqfrkgubdjeuviaww` (ap-southeast-2) → ใหม่ `fgmfxguonnqmfcoadrrj` (ap-southeast-1)

---

## 2. Checklist ที่ Nofffie ต้องทำเอง (Dashboard)

### A. ยืนยันว่าจะใช้โปรเจกต์ Supabase ตัวไหนเป็นตัวจริง
- [ ] เข้า Supabase Dashboard ดูสถานะทั้ง 2 โปรเจกต์
- [ ] ถ้าโปรเจกต์ใหม่ `fgmfxguonnqmfcoadrrj` มีข้อมูลครบ → ใช้ตัวนี้เป็น production
- [ ] เช็คว่าโปรเจกต์ที่จะใช้ **ไม่ได้อยู่สถานะ Paused** (ถ้า paused ให้กด Restore/Resume)

### B. รัน migration (ถ้ายังไม่ได้ย้าย หรือย้ายไม่ครบ)
- [ ] สร้างไฟล์ `migrate.env` ในเครื่อง (ดู `.env.example` ส่วนล่าง) — **ห้าม commit**
- [ ] ย้ายฐานข้อมูล: `node --env-file=migrate.env migrate-db.mjs`
- [ ] ย้ายไฟล์ media: `node --env-file=migrate.env migrate-s3.mjs`
- [ ] ตัว `migrate-s3.mjs` จะ **เปลี่ยนชื่อไฟล์ที่เป็นภาษาไทย/non-ASCII ให้ปลอดภัยอัตโนมัติ** และสร้างไฟล์ `s3-key-remap.json` (รายการ ไฟล์เก่า→ใหม่)
- [ ] นำ `s3-key-remap.json` ไปอัปเดตคอลัมน์ `filename` / `url` ของแถว media ใน DB ใหม่ ให้ตรงกับชื่อไฟล์ใหม่

### C. สลับ env บน Vercel ให้ชี้โปรเจกต์ที่ใช้งานจริง
ที่ **Vercel Dashboard → Project (sk-sport) → Settings → Environment Variables → Production** อัปเดต:
- [ ] `DATABASE_URI` → connection string (pooled, port 6543) ของโปรเจกต์ใหม่
- [ ] `S3_ENDPOINT` → `https://fgmfxguonnqmfcoadrrj.storage.supabase.co/storage/v1/s3`
- [ ] `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` / `S3_REGION` → ของโปรเจกต์ใหม่ (ap-southeast-1)
- [ ] `PAYLOAD_SECRET` → ค่าใหม่ (ดูข้อ 3)
- [ ] `RESEND_API_KEY` → ค่าใหม่ (ดูข้อ 3)
- [ ] **Redeploy** (Deployments → ⋯ → Redeploy) เพื่อให้ env ใหม่มีผล

### D. แก้รูปคุณ Nattanat (ถ้ายังไม่ขึ้นหลังสลับ env)
- [ ] เข้า `/admin` → คอลเลกชัน Founders → เปิดเรคคอร์ด Nattanat
- [ ] ดูว่า field `aboutImage` ผูกกับรูปไหน แล้วเปิดดูรูปนั้นในเมนู Media ว่าโหลดได้ไหม
- [ ] ถ้ารูปเดิม key เพี้ยน → **อัปโหลดรูปใหม่** (ตอนนี้ระบบ sanitize ชื่อไฟล์ให้แล้ว) แล้วผูก `aboutImage` ใหม่
- [ ] ทางที่แนะนำเวลาอัปโหลด: ตั้งชื่อไฟล์เป็นอังกฤษ เช่น `nattanat.webp`

### E. เรื่อง "เว็บเข้าอันเดิม" (เช็คชั้น cache/โดเมนด้วย)
- [ ] ยืนยันว่าลูกค้าเข้าโดเมนถูกตัว (โดเมนจริง vs `sk-sport.vercel.app`)
- [ ] หลัง redeploy ให้ลูกค้า **hard refresh** (Ctrl/Cmd+Shift+R) เผื่อ browser cache
- [ ] ถ้ามี custom domain ตรวจว่า DNS ชี้มา deployment ล่าสุด

---

## 3. Secret ที่ต้อง Rotate ทันที + ตั้งค่าใหม่ที่ไหน

> ⚠️ ค่าเหล่านี้ **เคยถูก commit เป็น plain text** ใน `vercel.env`, `migrate-db.mjs`, `migrate-s3.mjs`, `.github/workflows/ci.yml`
> ตอนนี้ลบออกจากไฟล์ปัจจุบันแล้ว แต่ **ยังอยู่ใน git history** ใครเปิด repo ย้อนดูได้ → **ต้องเปลี่ยนค่าใหม่ทั้งหมด**

| Secret | rotate ที่ไหน | ค่าใหม่ไปใส่ที่ |
|---|---|---|
| **รหัสผ่าน DB เก่า** (`LeAkz...`) | Supabase (เก่า) → Settings → Database → Reset password | — (เลิกใช้โปรเจกต์เก่า) |
| **รหัสผ่าน DB ใหม่** (`PookPon...`) | Supabase (ใหม่) → Settings → Database → Reset password | Vercel `DATABASE_URI` + `migrate.env` |
| **S3 access/secret keys** (เก่า+ใหม่) | Supabase → Settings → Storage → S3 access keys → สร้างใหม่ + ลบอันเก่า | Vercel `S3_ACCESS_KEY_ID`/`S3_SECRET_ACCESS_KEY` + `migrate.env` |
| **`PAYLOAD_SECRET`** (`06c6cd...`) | สร้างใหม่: `openssl rand -hex 16` | Vercel `PAYLOAD_SECRET` |
| **`RESEND_API_KEY`** (`re_aYMK...`) | Resend Dashboard → API Keys → revoke + สร้างใหม่ | Vercel `RESEND_API_KEY` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | **ไม่ต้อง rotate** — เป็น publishable key ที่ออกแบบให้ public อยู่แล้ว | — |

> หมายเหตุ: ถ้าอยากลบ secret ออกจาก git history ด้วย ต้องใช้ `git filter-repo` / BFG แล้ว force-push
> (กระทบทุกคนที่ clone อยู่) — การ **rotate ค่าใหม่** คือสิ่งที่จำเป็นที่สุดและทำก่อนได้เลย

---

## 4. หลักปฏิบัติเรื่อง env ต่อจากนี้

- ค่าจริงทั้งหมดอยู่ใน **Vercel Dashboard** เท่านั้น ไม่ commit เข้า repo
- ในเครื่อง dev ใช้ `.env` (ถูก git-ignore) — copy จาก `.env.example`
- สคริปต์ migration ใช้ `migrate.env` แยกต่างหาก (git-ignore) โหลดด้วย `node --env-file=migrate.env ...`
- `vercel.env` ใน repo เป็น **template (placeholder)** สำหรับอ้างอิงรายชื่อตัวแปรเท่านั้น

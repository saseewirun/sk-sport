/**
 * SK Sport Trading — CMS Guide Generator (Thai)
 * สร้างคู่มือการจัดการเนื้อหาเว็บไซต์ฉบับภาษาไทย (อัปเดตรวมส่วน Team Member ใหม่)
 *
 * วิธีรัน:
 *   npm install docx
 *   node generate_manual.js
 *
 * Output: SK-Sport_CMS_Guide_TH_Updated.docx (บันทึกในโฟลเดอร์เดียวกัน)
 */

'use strict'

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  WidthType,
  ShadingType,
  PageNumber,
  PageBreak,
  LevelFormat,
  TableOfContents,
} = require('docx')
const fs = require('fs')

// ─── COLOUR PALETTE ─────────────────────────────────────────────────────────
const C = {
  blue: '1A56DB',
  darkBlue: '1E3A8A',
  midBlue: '1E40AF',
  lightBlue: 'DBEAFE',
  subtitleBlue: 'EFF6FF',
  lineBlue: 'BFDBFE',
  warnBg: 'FEF3C7',
  warnBorder: 'F59E0B',
  warnText: '92400E',
  noteBg: 'D1FAE5',
  noteBorder: '059669',
  noteText: '065F46',
  redBg: 'FEE2E2',
  redBorder: 'EF4444',
  redText: '991B1B',
  white: 'FFFFFF',
  gray: '6B7280',
  lightGray: '9CA3AF',
  rowAlt: 'F0F4FF',
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function sp(afterPt = 80) {
  return new Paragraph({ children: [], spacing: { after: afterPt } })
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] })
}

function run(text, opts = {}) {
  return new TextRun({ text, font: 'Angsana New', size: 24, ...opts })
}

function para(text, extraRunOpts = {}, parOpts = {}) {
  return new Paragraph({
    children: [run(text, extraRunOpts)],
    spacing: { after: 80 },
    ...parOpts,
  })
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [run(text, { bold: true, size: 36, color: C.blue })],
    spacing: { before: 480, after: 240 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.lineBlue, space: 4 } },
  })
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [run(text, { bold: true, size: 28, color: C.darkBlue })],
    spacing: { before: 280, after: 140 },
  })
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [run(text, { bold: true, size: 24, color: C.midBlue })],
    spacing: { before: 200, after: 80 },
  })
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    children: [run(text)],
    spacing: { after: 60 },
  })
}

function numbered(text) {
  return new Paragraph({
    numbering: { reference: 'numbers', level: 0 },
    children: [run(text)],
    spacing: { after: 60 },
  })
}

/** Coloured info box (warning / note / danger) */
function infoBox(emoji, title, lines, bg, border, titleColor) {
  const bd = { style: BorderStyle.SINGLE, size: 4, color: border }
  const borders = { top: bd, bottom: bd, left: bd, right: bd }
  const children = [
    new Paragraph({
      children: [run(`${emoji}  ${title}`, { bold: true, size: 24, color: titleColor })],
      spacing: { after: 60 },
    }),
    ...lines.map(
      (l) =>
        new Paragraph({
          children: [run(l, { size: 22 })],
          spacing: { after: 40 },
        }),
    ),
  ]
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [9026],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders,
            shading: { fill: bg, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 180, right: 180 },
            width: { size: 9026, type: WidthType.DXA },
            children,
          }),
        ],
      }),
    ],
  })
}

function warnBox(title, lines) {
  return infoBox('⚠', title, lines, C.warnBg, C.warnBorder, C.warnText)
}
function noteBox(title, lines) {
  return infoBox('💡', title, lines, C.noteBg, C.noteBorder, C.noteText)
}
function dangerBox(title, lines) {
  return infoBox('🚫', title, lines, C.redBg, C.redBorder, C.redText)
}

/** Two-column field-description table */
function fieldTable(rows) {
  const hBd = { style: BorderStyle.SINGLE, size: 1, color: '93C5FD' }
  const cBd = { style: BorderStyle.SINGLE, size: 1, color: C.lineBlue }
  const hBds = { top: hBd, bottom: hBd, left: hBd, right: hBd }
  const cBds = { top: cBd, bottom: cBd, left: cBd, right: cBd }

  const tableRows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          borders: hBds,
          shading: { fill: C.midBlue, type: ShadingType.CLEAR },
          width: { size: 2900, type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [
            new Paragraph({
              children: [run('ช่องข้อมูล', { bold: true, size: 22, color: C.white })],
            }),
          ],
        }),
        new TableCell({
          borders: hBds,
          shading: { fill: C.midBlue, type: ShadingType.CLEAR },
          width: { size: 6126, type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [
            new Paragraph({
              children: [run('คำอธิบาย', { bold: true, size: 22, color: C.white })],
            }),
          ],
        }),
      ],
    }),
    ...rows.map(
      (r, i) =>
        new TableRow({
          children: [
            new TableCell({
              borders: cBds,
              shading: { fill: i % 2 === 0 ? C.subtitleBlue : C.white, type: ShadingType.CLEAR },
              width: { size: 2900, type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [new Paragraph({ children: [run(r[0], { bold: true, size: 22 })] })],
            }),
            new TableCell({
              borders: cBds,
              shading: { fill: i % 2 === 0 ? 'F8FAFF' : C.white, type: ShadingType.CLEAR },
              width: { size: 6126, type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [new Paragraph({ children: [run(r[1], { size: 22 })] })],
            }),
          ],
        }),
    ),
  ]

  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [2900, 6126],
    rows: tableRows,
  })
}

// ─── DOCUMENT ────────────────────────────────────────────────────────────────

const doc = new Document({
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
      {
        reference: 'numbers',
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: '%1.',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
    ],
  },
  styles: {
    default: { document: { run: { font: 'Angsana New', size: 24 } } },
    paragraphStyles: [
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 36, bold: true, font: 'Angsana New', color: C.blue },
        paragraph: { spacing: { before: 480, after: 240 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 28, bold: true, font: 'Angsana New', color: C.darkBlue },
        paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 },
      },
      {
        id: 'Heading3',
        name: 'Heading 3',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 24, bold: true, font: 'Angsana New', color: C.midBlue },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 },
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                run('SK Sport Trading', { bold: true, size: 20, color: C.blue }),
                run('   |   คู่มือการจัดการเนื้อหาเว็บไซต์', { size: 20, color: C.gray }),
              ],
              border: {
                bottom: { style: BorderStyle.SINGLE, size: 4, color: C.lineBlue, space: 4 },
              },
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                run('SK Sport Trading — ห้ามเผยแพร่โดยไม่ได้รับอนุญาต    ', {
                  size: 18,
                  color: C.lightGray,
                }),
                run('หน้า ', { size: 18, color: C.gray }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: 'Angsana New',
                  size: 18,
                  color: C.gray,
                }),
              ],
              alignment: AlignmentType.RIGHT,
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.lineBlue, space: 4 } },
            }),
          ],
        }),
      },
      children: [
        // ══════════════════════════════════════════════════
        // COVER PAGE
        // ══════════════════════════════════════════════════
        sp(480),
        sp(480),
        sp(480),
        new Paragraph({
          children: [run('SK Sport Trading', { bold: true, size: 64, color: C.blue })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 160 },
        }),
        new Paragraph({
          children: [run('คู่มือการจัดการเนื้อหาเว็บไซต์', { size: 44, color: C.darkBlue })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 160 },
        }),
        new Paragraph({
          children: [run('สำหรับทีมงาน SK Sport — ฉบับปรับปรุง', { size: 28, color: C.gray })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 480 },
        }),
        new Paragraph({
          children: [
            run('เวอร์ชัน 2.0  |  ปรับปรุงล่าสุด: พฤษภาคม 2568', { size: 24, color: C.lightGray }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
        }),
        new Paragraph({
          children: [
            run('เพิ่มเนื้อหา: ระบบทีมงาน (Team Member) หลายคน และวิดีโอ YouTube', {
              size: 22,
              color: C.gray,
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),

        // ══════════════════════════════════════════════════
        // TABLE OF CONTENTS
        // ══════════════════════════════════════════════════
        pageBreak(),
        new Paragraph({
          children: [run('สารบัญ', { bold: true, size: 36, color: C.blue })],
          spacing: { after: 200 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.lineBlue, space: 4 } },
        }),
        new TableOfContents('สารบัญ', { hyperlink: true, headingStyleRange: '1-3' }),

        // ══════════════════════════════════════════════════
        // บทที่ 1: เริ่มต้นใช้งาน CMS
        // ══════════════════════════════════════════════════
        pageBreak(),
        h1('บทที่ 1: เริ่มต้นใช้งานระบบ CMS'),
        para(
          'ระบบ CMS (Content Management System) คือเครื่องมือที่ช่วยให้ทีมงาน SK Sport สามารถแก้ไขข้อมูล รูปภาพ และเนื้อหาต่างๆ บนเว็บไซต์ได้ด้วยตนเอง โดยไม่จำเป็นต้องมีความรู้ด้านการเขียนโปรแกรม',
        ),
        sp(),

        h2('1.1 วิธีเข้าสู่ระบบ'),
        numbered('เปิดเว็บเบราว์เซอร์ (เช่น Chrome, Firefox, Edge)'),
        numbered('พิมพ์ URL: https://[โดเมนเว็บ]/admin แล้วกด Enter'),
        numbered('กรอกอีเมลและรหัสผ่านที่ได้รับจากผู้ดูแลระบบ'),
        numbered('กดปุ่ม "Login" เพื่อเข้าสู่ระบบ'),
        sp(),
        warnBox('ข้อควรระวังเรื่องความปลอดภัย', [
          '• ห้ามแชร์อีเมลและรหัสผ่านกับบุคคลภายนอก',
          '• กดปุ่ม "Log out" ทุกครั้งเมื่อเลิกใช้งาน โดยเฉพาะเมื่อใช้คอมพิวเตอร์สาธารณะ',
          '• หากลืมรหัสผ่านหรือสงสัยว่ารหัสผ่านรั่วไหล แจ้งผู้ดูแลระบบทันที',
        ]),
        sp(),

        h2('1.2 ภาพรวมเมนูหลัก'),
        para('หลังล็อกอินสำเร็จ จะเห็นเมนูด้านซ้ายมือ แบ่งออกเป็นหมวดดังนี้:'),
        sp(60),
        fieldTable([
          ['Content', 'จัดการเนื้อหาหลัก: About, Home, FAQ, สินค้า, บริการ, ผลงาน, ทีมงาน'],
          ['Page Heroes', 'จัดการแบนเนอร์หัวหน้า (Banner) ของแต่ละหน้า'],
          ['Checkout', 'ตั้งค่าการชำระเงินและดูคำขอใบเสนอราคา'],
          ['Media / Files', 'อัปโหลดและจัดการไฟล์รูปภาพ'],
        ]),
        sp(),
        noteBox('เคล็ดลับสำคัญ', [
          'กด "Save" หรือ "Publish" ทุกครั้งหลังแก้ไข มิฉะนั้นข้อมูลจะสูญหาย',
          'การเปลี่ยนแปลงจะแสดงบนเว็บไซต์ทันทีหลังบันทึก',
          'หากเว็บยังไม่เปลี่ยน ให้กด Ctrl+Shift+R (Windows) หรือ Cmd+Shift+R (Mac) เพื่อล้างแคช',
        ]),
        sp(),

        h2('1.3 การอัปโหลดรูปภาพ'),
        para('รูปภาพทุกชนิดต้องอัปโหลดเข้า Media ก่อน จึงจะนำมาใช้ใน CMS ได้'),
        numbered('คลิกที่ชื่อช่องรูปภาพ หรือปุ่ม "Choose" / "Upload"'),
        numbered('เลือกรูปจากคอมพิวเตอร์'),
        numbered('รอให้อัปโหลดสำเร็จ'),
        numbered('กด "Select" เพื่อเลือกใช้รูปนั้น'),
        sp(60),
        warnBox('ขนาดรูปภาพที่แนะนำ', [
          '• รูป Hero / Banner: ขนาดไม่เกิน 2MB ความละเอียด 1920×1080 px (แนวนอน)',
          '• รูปการ์ดสมาชิกทีมงาน: ความละเอียด 600×800 px (แนวตั้ง อัตราส่วน 3:4)',
          '• รูปสินค้า/บริการ: ไม่เกิน 1MB ความละเอียด 800×600 px',
          '• ไฟล์รองรับ: .jpg, .jpeg, .png, .webp',
        ]),
        sp(),

        // ══════════════════════════════════════════════════
        // บทที่ 2: หน้า Home
        // ══════════════════════════════════════════════════
        pageBreak(),
        h1('บทที่ 2: หน้า Home (หน้าหลักเว็บไซต์)'),
        para('วิธีเข้าแก้ไข: เมนูซ้าย → Content → Home'),
        sp(),

        h2('2.1 รูปภาพและสื่อบนหน้าหลัก'),
        fieldTable([
          ['รูป/วิดีโอ Hero', 'รูปหรือวิดีโอบนแบนเนอร์หลัก เพิ่มได้หลายรูป ระบบสลับอัตโนมัติ'],
          ['รูปแกลเลอรี', 'รูปภาพในส่วนแกลเลอรีของหน้าแรก เลือกได้หลายรูป'],
          [
            'พาร์ตเนอร์ (โลโก้)',
            'โลโก้บริษัทพาร์ตเนอร์ที่แสดงในส่วน Our Partners ลำดับตามที่เลือก',
          ],
        ]),
        sp(),

        h2('2.2 การปรับขนาดตัวอักษรหน้าหลัก'),
        fieldTable([
          ['ขนาดหัวข้อ Hero', 'หัวข้อหลักบนแบนเนอร์ ค่าได้ 32–96px (เริ่มต้น: 56px)'],
          ['ขนาดคำอธิบาย Hero', 'คำอธิบายใต้หัวข้อ ค่าได้ 14–32px (เริ่มต้น: 20px)'],
          ['ขนาดหัวข้อ Section', 'หัวข้อของแต่ละส่วน เช่น บริการ สินค้า ผลงาน ค่าได้ 20–56px'],
          ['ขนาดหัวข้อเนื้อหาเน้น', 'หัวย่อยในบล็อกเนื้อหา ค่าได้ 20–48px (เริ่มต้น: 28px)'],
          ['ขนาดหัวข้อบนการ์ด', 'ชื่อบนการ์ดบริการ/สินค้า/ผลงาน ค่าได้ 16–36px (เริ่มต้น: 20px)'],
          ['ขนาดเนื้อหาในการ์ด', 'คำอธิบายใต้ชื่อบนการ์ด ค่าได้ 12–22px (เริ่มต้น: 14px)'],
        ]),
        sp(),

        // ══════════════════════════════════════════════════
        // บทที่ 3: หน้า About Us
        // ══════════════════════════════════════════════════
        pageBreak(),
        h1('บทที่ 3: หน้า About Us (เกี่ยวกับเรา)'),
        para('หน้า About Us ประกอบด้วยหลายส่วน ซึ่งจัดการแยกกันในเมนู CMS ดังนี้:'),
        sp(60),
        fieldTable([
          ['Page Heroes → About Hero', 'แบนเนอร์หัวหน้า (รูปพื้นหลัง หัวข้อ คำอธิบาย)'],
          ['Content → About', 'เนื้อหาหลัก: บริษัท สถิติ พันธกิจ วิสัยทัศน์ วิดีโอ ขนาดตัวอักษร'],
          ['Content → Founders', 'ทีมงาน (Team Member) — รายการสมาชิกหลายคน ✨ ใหม่'],
        ]),
        sp(),

        h2('3.1 แบนเนอร์หน้า About (About Hero)'),
        para('วิธีเข้าแก้ไข: เมนูซ้าย → Page Heroes → About Hero'),
        sp(60),
        fieldTable([
          ['หัวข้อหลัก Hero', 'ข้อความขนาดใหญ่บนแบนเนอร์หน้า About'],
          ['คำอธิบายใต้หัวข้อ Hero', 'ข้อความย่อยใต้หัวข้อ'],
          ['รูปภาพ Hero', 'รูปพื้นหลังแบนเนอร์ เพิ่มได้หลายรูป'],
          ['ขนาดหัวข้อ Hero', '32–96px (เริ่มต้น: 56px)'],
          ['ขนาดคำอธิบาย Hero', '14–32px (เริ่มต้น: 20px)'],
        ]),
        sp(),

        h2('3.2 ข้อมูลบริษัทและสถิติ'),
        para('วิธีเข้าแก้ไข: เมนูซ้าย → Content → About'),
        sp(60),
        fieldTable([
          ['ชื่อบริษัท', 'แสดงใต้หัว "About Us" บนหน้าเว็บ เช่น "SK Sport Trading Co., Ltd."'],
          [
            'ไฮไลต์ / สถิติ',
            'กล่องตัวเลขสถิติ เพิ่มได้หลายรายการ แต่ละรายการมีช่อง "ค่า" และ "คำอธิบาย"',
          ],
        ]),
        sp(60),
        noteBox('ตัวอย่างการกรอกสถิติ', [
          'ค่า (ตัวเลข): 20+       คำอธิบาย: ปีประสบการณ์',
          'ค่า (ตัวเลข): 500+      คำอธิบาย: โครงการที่ส่งมอบ',
          'ค่า (ตัวเลข): 50+       คำอธิบาย: แบรนด์พาร์ตเนอร์',
        ]),
        sp(),

        h2('3.3 พันธกิจและวิสัยทัศน์'),
        para('วิธีเข้าแก้ไข: เมนูซ้าย → Content → About (เลื่อนลงมาส่วนพันธกิจ)'),
        sp(60),
        fieldTable([
          ['หัวข้อพันธกิจ', 'ชื่อหัวข้อ เช่น "พันธกิจของเรา"'],
          ['รายละเอียดพันธกิจ', 'เนื้อหาอธิบายพันธกิจขององค์กร'],
          ['หัวข้อวิสัยทัศน์', 'ชื่อหัวข้อ เช่น "วิสัยทัศน์"'],
          ['รายละเอียดวิสัยทัศน์', 'เนื้อหาอธิบายวิสัยทัศน์ขององค์กร'],
        ]),
        sp(),

        // ── NEW FEATURE ──────────────────────────────────────────────────────
        h2('3.4 ทีมงาน (Team Member) — ฟีเจอร์ใหม่'),
        para(
          'ระบบทีมงานถูกปรับปรุงใหม่ทั้งหมด ตอนนี้รองรับสมาชิกหลายคน แต่ละคนมีหน้ารายละเอียดของตัวเอง และสามารถซ่อน/แสดงแยกได้',
        ),
        sp(60),
        noteBox('ข้อแตกต่างจากระบบเดิม', [
          'ระบบเดิม: แสดงสมาชิกได้เพียง 1 คน กำหนดในหน้า About Global',
          'ระบบใหม่: รองรับสมาชิกหลายคน จัดการผ่าน Content → Founders',
          'สมาชิกแต่ละคนมีหน้ารายละเอียดส่วนตัวที่ /about/founders/[ชื่อ-URL]',
        ]),
        sp(),

        h3('3.4.1 ตั้งชื่อหัวข้อส่วนทีมงาน'),
        para('วิธีเข้าแก้ไข: Content → About → ช่อง "หัวข้อส่วน Team Member"'),
        para(
          'ค่าเริ่มต้น: "Team Member" — สามารถเปลี่ยนเป็น "ทีมงานของเรา" หรือชื่ออื่นได้ตามต้องการ',
        ),
        sp(),

        h3('3.4.2 การเพิ่มสมาชิกทีมงานใหม่'),
        para('วิธีเข้าแก้ไข: เมนูซ้าย → Content → Founders → กดปุ่ม "Create New"'),
        sp(60),
        fieldTable([
          ['ชื่อ (Name)', 'ชื่อเต็มของสมาชิก — จำเป็นต้องกรอก'],
          ['Slug', 'ที่อยู่ URL หน้ารายละเอียด ระบบสร้างอัตโนมัติจากชื่อ ไม่ต้องกรอกเอง'],
          ['ตำแหน่ง (Role)', 'ตำแหน่งงาน เช่น "Managing Director", "Sales Manager"'],
          ['คำอธิบายสั้น (Excerpt)', 'ข้อความสั้น 1–2 ประโยคที่แสดงบนการ์ดในหน้า About'],
          ['คำอธิบายเต็ม', 'ประวัติหรือข้อมูลละเอียดที่แสดงบนหน้ารายละเอียดส่วนตัว'],
          ['คำคม (Quote)', 'ข้อความพิเศษ (Blockquote) แสดงบนการ์ดและหน้ารายละเอียด'],
          ['รูปสำหรับการ์ด', 'รูปที่แสดงบนการ์ดในหน้า About (แนะนำ: แนวตั้ง สัดส่วน 3:4)'],
          ['แกลเลอรี', 'รูปหลายรูปสำหรับหน้ารายละเอียดส่วนตัวเท่านั้น'],
          ['ลำดับการแสดง', 'ตัวเลขกำหนดลำดับ — เลขน้อยแสดงก่อน (0 = แรกสุด, 1 = ถัดไป)'],
          ['แสดงบนเว็บ', 'ติ๊กถูก = แสดงบนเว็บ | ปลดติ๊ก = ซ่อนชั่วคราว โดยไม่ต้องลบข้อมูล'],
        ]),
        sp(),
        noteBox('ขั้นตอนเพิ่มสมาชิกทีมงาน', [
          '1. คลิก Content → Founders → "Create New"',
          '2. กรอกชื่อ (Name) — ช่องนี้จำเป็นต้องกรอก',
          '3. กรอกตำแหน่ง คำอธิบายสั้น คำอธิบายเต็ม และคำคม (ตามต้องการ)',
          '4. อัปโหลดรูปสำหรับการ์ด (และรูปแกลเลอรีหากมี)',
          '5. ตั้งลำดับการแสดง (เลขน้อยแสดงก่อน)',
          '6. ตรวจสอบว่าช่อง "แสดงบนเว็บ" ถูกติ๊กอยู่',
          '7. กด Save',
        ]),
        sp(60),
        warnBox('ข้อควรระวังเรื่อง Slug', [
          '• Slug คือส่วนที่อยู่ใน URL เช่น หากชื่อ "Sasiwiral Kaenchanhom" Slug จะเป็น "sasiwiral-kaenchanhom"',
          '• ระบบสร้าง Slug อัตโนมัติเมื่อบันทึกครั้งแรก — ไม่ต้องกรอกเอง',
          '• ห้ามแก้ไข Slug หลังจากที่มีการแชร์ลิงก์ออกไปแล้ว เพราะลิงก์เดิมจะพัง',
          '• Slug ใช้ได้เฉพาะตัวอักษรภาษาอังกฤษตัวพิมพ์เล็ก ตัวเลข และขีดกลาง (-)',
        ]),
        sp(),

        h3('3.4.3 การแก้ไขข้อมูลสมาชิก'),
        numbered('คลิก Content → Founders'),
        numbered('คลิกชื่อสมาชิกในรายการ'),
        numbered('แก้ไขข้อมูลที่ต้องการ'),
        numbered('กด Save'),
        sp(),

        h3('3.4.4 การซ่อน/แสดงสมาชิก (ไม่ต้องลบข้อมูล)'),
        para('เหมาะสำหรับกรณีที่ต้องการซ่อนสมาชิกชั่วคราว เช่น รอรูปถ่าย หรืออยู่ระหว่างลางาน'),
        numbered('เปิดข้อมูลสมาชิกที่ต้องการ'),
        numbered('ปลดติ๊กที่ช่อง "แสดงบนเว็บ (Visible on site)"'),
        numbered('กด Save — สมาชิกจะหายไปจากเว็บแต่ข้อมูลยังอยู่ในระบบ'),
        sp(),

        h3('3.4.5 การเรียงลำดับสมาชิก'),
        para('ลำดับการแสดงบนเว็บกำหนดโดยช่อง "ลำดับการแสดง (Sort order)"'),
        bullet('เลขน้อย = แสดงก่อน (0 หรือ 1 = อยู่บนสุด)'),
        bullet('เลขมาก = แสดงทีหลัง'),
        bullet('ตัวอย่าง: สมาชิก A ลำดับ 1, สมาชิก B ลำดับ 2 → A แสดงก่อน B'),
        sp(),

        // ── VIDEO SECTION ─────────────────────────────────────────────────────
        h2('3.5 วิดีโอ YouTube'),
        para('วิธีเข้าแก้ไข: เมนูซ้าย → Content → About → เลื่อนไปส่วน "คลิป YouTube"'),
        sp(60),
        fieldTable([
          ['หัวข้อ Section วิดีโอ', 'หัวข้อที่แสดงเหนือส่วนวิดีโอ ค่าเริ่มต้น: "Video"'],
          ['ชื่อคลิป (Title)', 'ชื่อที่แสดงใต้วิดีโอแต่ละตัว (ไม่บังคับ)'],
          ['ลิงก์ YouTube', 'URL วิดีโอ YouTube เช่น https://www.youtube.com/watch?v=xxxxx'],
          ['คำอธิบาย iframe', 'ชื่อสำหรับระบบ ผู้ใช้งานทั่วไปไม่เห็น ค่าเริ่มต้น: "YouTube video"'],
        ]),
        sp(60),
        noteBox('วิธีเพิ่มวิดีโอใหม่', [
          '1. คลิก "เพิ่มรายการ" ในส่วนคลิป YouTube',
          '2. กรอกชื่อคลิป (ไม่บังคับ)',
          '3. วาง URL วิดีโอ YouTube',
          '4. กด Save',
          'หากเพิ่มหลายวิดีโอ จะแสดงแบบ 2 คอลัมน์โดยอัตโนมัติ',
        ]),
        sp(60),
        warnBox('ข้อควรระวังวิดีโอ', [
          '• ระบบรองรับเฉพาะลิงก์ YouTube เท่านั้น ไม่รองรับ Vimeo หรือเว็บอื่น',
          '• ห้ามวางโค้ด iframe ทั้งชุด — ให้วางแค่ URL เท่านั้น',
          '• หากวิดีโอไม่แสดง ตรวจสอบว่า: (1) URL ถูกต้อง และ (2) วิดีโอไม่ได้ตั้งค่าเป็น Private',
        ]),
        sp(),

        h2('3.6 ส่วนลิงก์ไปยังหน้าอื่น'),
        para('ส่วนเหล่านี้แสดงลิงก์ไปยังหน้า Portfolio, Services, Products สามารถแก้ข้อความได้:'),
        sp(60),
        fieldTable([
          ['หัวข้อส่วนโปรเจกต์เด่น', 'หัวข้อส่วนที่แสดงผลงานเด่น'],
          ['คำอธิบายส่วนโปรเจกต์', 'ข้อความอธิบายใต้หัวข้อ'],
          ['ข้อความปุ่ม CTA โปรเจกต์', 'ข้อความบนปุ่ม เช่น "ดูผลงานทั้งหมด"'],
          ['หัวข้อส่วน Services', 'หัวข้อส่วนบริการ'],
          ['คำอธิบายส่วน Services', 'ข้อความอธิบายบริการ'],
          ['ข้อความปุ่ม CTA Services', 'ข้อความบนปุ่มบริการ'],
          ['หัวข้อส่วน Products', 'หัวข้อส่วนสินค้า'],
          ['คำอธิบายส่วน Products', 'ข้อความอธิบายสินค้า'],
          ['ข้อความปุ่ม CTA Products', 'ข้อความบนปุ่มสินค้า'],
        ]),
        sp(),

        h2('3.7 การปรับขนาดตัวอักษรหน้า About'),
        para('ทุกช่องต่อไปนี้อยู่ใน Content → About:'),
        sp(60),
        fieldTable([
          [
            'ขนาดหัวข้อแต่ละ Section',
            '22–56px  (เริ่มต้น: 32px)  — หัว "About Us", "Team Member" ฯลฯ',
          ],
          ['ขนาดหัวข้อการ์ดไฮไลต์', '16–36px  (เริ่มต้น: 20px)  — ชื่อบนการ์ดไฮไลต์ 4 ใบ'],
          ['ขนาดเนื้อหาการ์ดไฮไลต์', '13–24px  (เริ่มต้น: 15px)  — เนื้อหาในการ์ดไฮไลต์'],
          ['ขนาดตัวเลขสถิติ', '20–48px  (เริ่มต้น: 28px)  — ตัวเลขในกล่องสถิติ'],
          ['ขนาดคำอธิบายสถิติ', '12–22px  (เริ่มต้น: 14px)  — คำอธิบายใต้ตัวเลข'],
          ['ขนาดหัวข้อพันธกิจ/วิสัยทัศน์', '20–48px  (เริ่มต้น: 28px)'],
          ['ขนาดเนื้อหาพันธกิจ/วิสัยทัศน์', '14–24px  (เริ่มต้น: 16px)'],
          ['ขนาดหัวข้อ Section วิดีโอ', '20–56px  (เริ่มต้น: 32px)'],
          ['ขนาดชื่อบนการ์ด Founder', '20–48px  (เริ่มต้น: 28px)'],
          ['ขนาดคำอธิบายบนการ์ด Founder', '14–24px  (เริ่มต้น: 16px)'],
          ['ขนาดคำคมบนการ์ด Founder', '14–28px  (เริ่มต้น: 18px)'],
          ['ขนาดหัวข้อหน้ารายละเอียด Founder', '28–72px  (เริ่มต้น: 42px)'],
          ['ขนาดเนื้อหาหน้ารายละเอียด Founder', '14–24px (เริ่มต้น: 16px)'],
        ]),
        sp(),

        // ══════════════════════════════════════════════════
        // บทที่ 4: สินค้า
        // ══════════════════════════════════════════════════
        pageBreak(),
        h1('บทที่ 4: สินค้า (Products)'),
        para('วิธีเข้าแก้ไข: เมนูซ้าย → Content → Products'),
        sp(),

        h2('4.1 การเพิ่มสินค้าใหม่'),
        numbered('คลิกปุ่ม "Create New"'),
        numbered('กรอกชื่อสินค้า (Title) — จำเป็นต้องกรอก'),
        numbered('กรอกชื่อรอง (Subtitle) ถ้ามี'),
        numbered('กรอกหมวดหมู่ (Category)'),
        numbered('เลือกโหมดการขาย (Sales Mode)'),
        numbered('กรอกคำอธิบายสินค้า (Description) — จำเป็นต้องกรอก'),
        numbered('อัปโหลดรูปสินค้า (Image)'),
        numbered('กรอก Slug ที่อยู่ URL เช่น gymnastic-mat'),
        numbered('กด Save'),
        sp(),
        fieldTable([
          ['ชื่อสินค้า (Title)', 'ชื่อสินค้าหลัก จำเป็นต้องกรอก'],
          ['ชื่อรอง (Subtitle)', 'ข้อความสั้นๆ ใต้ชื่อสินค้า'],
          ['หมวดหมู่', 'หมวดสินค้า เช่น อุปกรณ์กีฬา, อุปกรณ์ยิมนาสติก'],
          ['โหมดการขาย', '"Quote only" = ลูกค้าขอใบเสนอราคา | "Buy" = ซื้อได้เลยและมีราคาแสดง'],
          ['ราคา (Price)', 'กรอกเฉพาะโหมด Buy หน่วยเป็นบาท'],
          ['คำอธิบาย', 'รายละเอียดสินค้า จำเป็นต้องกรอก'],
          ['รูปสินค้า', 'รูปหลักสินค้า 1 รูป'],
          ['Slug', 'URL ของหน้าสินค้า เช่น gymnastic-mat → เว็บ/products/gymnastic-mat'],
        ]),
        sp(),
        warnBox('ข้อควรระวัง Slug สินค้า', [
          '• Slug ต้องไม่ซ้ำกับสินค้าอื่นในระบบ',
          '• ใช้ได้เฉพาะตัวอักษรอังกฤษตัวพิมพ์เล็ก ตัวเลข และขีดกลาง (-)',
          '• ห้ามแก้ไข Slug หลังจากเว็บไซต์เผยแพร่ใช้งานแล้ว',
        ]),
        sp(),

        h2('4.2 แบนเนอร์หน้า Products'),
        para('วิธีเข้าแก้ไข: เมนูซ้าย → Page Heroes → Products Hero'),
        para('ตั้งค่าหัวข้อ คำอธิบาย และรูปพื้นหลังของแบนเนอร์หน้า Products ได้ที่นี่'),
        sp(),

        // ══════════════════════════════════════════════════
        // บทที่ 5: บริการ
        // ══════════════════════════════════════════════════
        pageBreak(),
        h1('บทที่ 5: บริการ (Services)'),
        para('วิธีเข้าแก้ไข: เมนูซ้าย → Content → Services'),
        sp(),

        h2('5.1 ข้อมูลบริการ'),
        fieldTable([
          ['ชื่อบริการ (Title)', 'ชื่อหลักของบริการ จำเป็นต้องกรอก'],
          ['ชื่อรอง (Subtitle)', 'คำอธิบายสั้น'],
          ['รูปหัว (Hero)', 'รูปที่แสดงบนหน้าบริการ'],
          ['Slug', 'URL บริการ ระบบสร้างอัตโนมัติจากชื่อ'],
          ['Tags', 'คำแท็กสำหรับจัดหมวดหมู่'],
        ]),
        sp(),

        h2('5.2 การเพิ่มเนื้อหาภายในบริการ (Sections)'),
        para('แต่ละบริการสามารถมีหลาย Section ซึ่งแต่ละ Section เลือก Layout ได้:'),
        sp(60),
        fieldTable([
          ['ชื่อ Section', 'หัวข้อของส่วนนี้ จำเป็นต้องกรอก'],
          ['คำอธิบาย', 'เนื้อหาอธิบาย'],
          ['Layout: Column (Grid รูป)', 'แสดงรูปหลายรูปแบบกริด เหมาะสำหรับ Gallery'],
          ['Layout: Row (รูป + ข้อความ)', 'แสดงรูปด้านซ้ายหรือขวาคู่กับข้อความ'],
          ['ตำแหน่งรูป (Alignment)', 'เฉพาะ Row: ซ้าย (Left) หรือ ขวา (Right)'],
        ]),
        sp(),

        h2('5.3 แบนเนอร์หน้า Services'),
        para('วิธีเข้าแก้ไข: เมนูซ้าย → Page Heroes → Services Hero'),
        sp(),

        // ══════════════════════════════════════════════════
        // บทที่ 6: Portfolio
        // ══════════════════════════════════════════════════
        pageBreak(),
        h1('บทที่ 6: ผลงาน (Portfolio)'),
        para('วิธีเข้าแก้ไข: เมนูซ้าย → Content → Portfolio Articles'),
        sp(),
        para('แต่ละผลงานคือบทความที่แสดงบนหน้า Portfolio กดปุ่ม "Create New" เพื่อเพิ่มผลงานใหม่'),
        sp(60),
        noteBox('คำแนะนำ', [
          'ชื่อผลงาน (Title) ควรกระชับ สื่อความหมาย เพื่อให้การ์ดดูสวยงาม',
          'รูปภาพควรมีสัดส่วน 16:9 หรือ 4:3 เพื่อให้แสดงผลถูกต้องบนการ์ด',
        ]),
        sp(),

        h2('6.1 แบนเนอร์หน้า Portfolio'),
        para('วิธีเข้าแก้ไข: เมนูซ้าย → Page Heroes → Portfolio Hero'),
        sp(),

        // ══════════════════════════════════════════════════
        // บทที่ 7: ติดต่อเรา
        // ══════════════════════════════════════════════════
        pageBreak(),
        h1('บทที่ 7: ติดต่อเรา (Contact)'),
        para('วิธีเข้าแก้ไข: เมนูซ้าย → Page Heroes → Contact Hero'),
        sp(),

        h2('7.1 แบนเนอร์และข้อมูลติดต่อ'),
        fieldTable([
          ['หัวข้อหลัก Hero', 'ข้อความหัวข้อบนแบนเนอร์หน้าติดต่อ'],
          ['คำอธิบาย Hero', 'ข้อความย่อยใต้หัวข้อ'],
          ['รูปภาพ Hero', 'รูปพื้นหลังแบนเนอร์'],
          ['ลิงก์ Google Map Embed', 'URL สำหรับแสดงแผนที่ Google บนหน้าติดต่อและหน้าหลัก'],
        ]),
        sp(60),
        fieldTable([
          ['ขนาดหัวข้อ Hero', '32–96px (เริ่มต้น: 56px)'],
          ['ขนาดคำอธิบาย Hero', '14–32px (เริ่มต้น: 20px)'],
          ['ขนาดหัวข้อ Section', '20–48px (เริ่มต้น: 28px)'],
          ['ขนาดหัวข้อกล่องข้อมูล', '14–32px (เริ่มต้น: 18px)'],
          ['ขนาดเนื้อหากล่องข้อมูล', '14–24px (เริ่มต้น: 16px)'],
        ]),
        sp(),

        h2('7.2 วิธีตั้งค่า Google Map Embed'),
        numbered('เปิด Google Maps (maps.google.com) ในเบราว์เซอร์'),
        numbered('ค้นหาที่อยู่ของบริษัท'),
        numbered('คลิก Share (แชร์) → แท็บ "Embed a map"'),
        numbered('คลิก "COPY HTML" เพื่อคัดลอกโค้ด'),
        numbered('จากโค้ดที่ได้ ให้ค้นหา src="..." แล้วคัดลอกเฉพาะ URL ภายใน เครื่องหมาย " "'),
        numbered('นำ URL ที่ได้ไปวางในช่อง "ลิงก์ Google Map Embed" ใน CMS'),
        numbered('กด Save'),
        sp(60),
        warnBox('แผนที่ใช้ร่วมกัน 2 หน้า', [
          '• ลิงก์ Google Map ที่ตั้งค่าที่นี่ จะแสดงทั้งบนหน้า Contact และหน้า Home พร้อมกัน',
          '• หากต้องการเปลี่ยนแผนที่ ตั้งค่าที่จุดนี้จุดเดียว ทั้ง 2 หน้าจะเปลี่ยนพร้อมกัน',
        ]),
        sp(),

        // ══════════════════════════════════════════════════
        // บทที่ 8: FAQ
        // ══════════════════════════════════════════════════
        pageBreak(),
        h1('บทที่ 8: คำถามที่พบบ่อย (FAQ)'),
        para('วิธีเข้าแก้ไข: เมนูซ้าย → Content → FAQ'),
        sp(),

        h2('8.1 การตั้งค่าแบนเนอร์'),
        fieldTable([
          ['หัวข้อหน้า FAQ', 'ข้อความหัวข้อบนแบนเนอร์'],
          ['คำอธิบาย/บทนำ', 'ข้อความอธิบายใต้หัวข้อ'],
          [
            'คำอธิบาย CTA ด้านล่าง',
            'ข้อความในกล่อง CTA ล่างสุด เช่น "หาคำตอบไม่เจอ? ติดต่อเราได้เลย"',
          ],
        ]),
        sp(60),
        fieldTable([
          ['ขนาดหัวข้อ Hero', '32–96px (เริ่มต้น: 56px)'],
          ['ขนาดคำอธิบาย Hero', '14–32px (เริ่มต้น: 20px)'],
          ['ขนาดตัวอักษรคำถาม', '14–32px (เริ่มต้น: 18px)'],
          ['ขนาดตัวอักษรคำตอบ', '14–24px (เริ่มต้น: 16px)'],
          ['ขนาดหัวข้อ CTA ล่าง', '20–48px (เริ่มต้น: 28px)'],
          ['ขนาดเนื้อหา CTA ล่าง', '14–24px (เริ่มต้น: 16px)'],
        ]),
        sp(),

        h2('8.2 การเพิ่มคำถาม-คำตอบ'),
        para('ในส่วน "รายการคำถาม-คำตอบ" คลิก "เพิ่มรายการ" เพื่อเพิ่มแต่ละคู่:'),
        numbered('กรอกคำถาม (Question) — จำเป็นต้องกรอก'),
        numbered('กรอกคำตอบ (Answer) — จำเป็นต้องกรอก'),
        numbered('กด Save'),
        sp(60),
        noteBox('การเรียงลำดับคำถาม', [
          'คำถามแสดงตามลำดับที่เพิ่มเข้ามา',
          'หากต้องการเปลี่ยนลำดับ ลากรายการขึ้น/ลงในรายการ แล้วกด Save',
        ]),
        sp(),

        // ══════════════════════════════════════════════════
        // บทที่ 9: ระบบขอใบเสนอราคา
        // ══════════════════════════════════════════════════
        pageBreak(),
        h1('บทที่ 9: ระบบขอใบเสนอราคา (Quote Request)'),
        para(
          'ระบบนี้ช่วยให้ลูกค้าส่งรายการสินค้าที่ต้องการขอราคาได้ โดยไม่ต้องผ่านการชำระเงินจริง ใช้ได้เฉพาะสินค้าที่ตั้งโหมดเป็น "Quote only"',
        ),
        sp(),

        h2('9.1 การดูรายการขอใบเสนอราคา'),
        numbered('เมนูซ้าย → Checkout → Quote Requests'),
        numbered('คลิกรายการที่ต้องการดูรายละเอียด'),
        sp(60),
        noteBox('การแจ้งเตือนอีเมล', [
          'เมื่อลูกค้าส่งคำขอ ระบบส่งอีเมลแจ้งเตือนให้ทีมงานโดยอัตโนมัติ',
          'ตั้งค่าอีเมลรับแจ้งเตือนได้ที่ Checkout → Payment Settings → อีเมลรับแจ้งเตือน',
        ]),
        sp(),

        // ══════════════════════════════════════════════════
        // บทที่ 10: การตั้งค่า
        // ══════════════════════════════════════════════════
        pageBreak(),
        h1('บทที่ 10: การตั้งค่า (Settings)'),

        h2('10.1 ตั้งค่าการชำระเงิน'),
        para('วิธีเข้าแก้ไข: เมนูซ้าย → Checkout → Payment Settings'),
        sp(60),
        fieldTable([
          ['เปิดใช้ Bank Transfer', 'เปิด/ปิดการแสดงข้อมูลธนาคารบนหน้าชำระเงิน'],
          ['อีเมลรับแจ้งเตือน', 'อีเมลรับแจ้งเมื่อมีคำสั่งซื้อหรือขอใบเสนอราคาใหม่'],
          ['ชื่อธนาคาร', 'ชื่อธนาคาร เช่น ธนาคารกสิกรไทย'],
          ['ชื่อบัญชี', 'ชื่อเจ้าของบัญชี'],
          ['เลขบัญชี', 'หมายเลขบัญชีธนาคาร'],
          ['สาขา', 'สาขาธนาคาร'],
          ['คำแนะนำการชำระเงิน', 'ข้อความแนะนำวิธีโอนเงินให้ลูกค้า'],
          ['QR Code', 'รูป QR Code สำหรับพร้อมเพย์หรือการโอน (ไม่บังคับ)'],
        ]),
        sp(60),
        warnBox('ข้อควรระวังข้อมูลธนาคาร', [
          '• ตรวจสอบเลขบัญชีให้ถูกต้องก่อนบันทึก เพราะข้อมูลนี้แสดงต่อลูกค้าโดยตรง',
          '• หากต้องการเปลี่ยนบัญชีธนาคาร แจ้งทีม IT ก่อนแก้ไข',
        ]),
        sp(),

        h2('10.2 ความเป็นส่วนตัวและข้อกำหนด'),
        para('แก้ไขหน้า Privacy Policy และ Terms of Service ได้ที่:'),
        bullet('Content → Privacy Policy'),
        bullet('Content → Terms of Service'),
        sp(),

        // ══════════════════════════════════════════════════
        // ภาคผนวก: คำถามที่พบบ่อย
        // ══════════════════════════════════════════════════
        pageBreak(),
        h1('ภาคผนวก: ปัญหาที่พบบ่อยและวิธีแก้ไข'),

        h2('แก้ไขข้อมูลแล้วทำไมไม่เปลี่ยนบนเว็บ?'),
        para(
          'ตรวจสอบว่ากด "Save" หรือ "Publish" หลังแก้ไขแล้วหรือยัง หากกดแล้วยังไม่เปลี่ยน ให้กด Ctrl+Shift+R (Windows) หรือ Cmd+Shift+R (Mac) เพื่อล้างแคชเบราว์เซอร์ หากยังไม่เปลี่ยน แจ้งทีม IT',
        ),
        sp(),

        h2('ลบข้อมูลไปแล้ว อยากได้คืน ทำได้ไหม?'),
        para(
          'โดยทั่วไปการลบข้อมูลไม่สามารถยกเลิกได้ แนะนำให้ซ่อนรายการด้วยการปลดติ๊ก "แสดงบนเว็บ" แทนการลบ เพื่อป้องกันการสูญหายของข้อมูล',
        ),
        sp(),

        h2('เพิ่มสมาชิกทีมงานแล้วทำไมไม่แสดงบนเว็บ?'),
        para('ตรวจสอบ 2 จุด:'),
        numbered('ช่อง "แสดงบนเว็บ (Visible on site)" ต้องติ๊กอยู่'),
        numbered('ช่อง "ชื่อ (Name)" ต้องกรอก เพราะเป็นช่องที่จำเป็น'),
        sp(),

        h2('เพิ่มวิดีโอแล้วไม่แสดง?'),
        para('ตรวจสอบ 3 จุด:'),
        numbered('URL ต้องเป็นลิงก์ YouTube จริงๆ เช่น https://www.youtube.com/watch?v=xxxxx'),
        numbered('ห้ามวางโค้ด iframe — ให้วางแค่ URL'),
        numbered('วิดีโอใน YouTube ต้องตั้งค่าเป็น Public ไม่ใช่ Private'),
        sp(),

        h2('ขนาดรูปที่เหมาะสมคือเท่าไร?'),
        bullet('รูป Hero / Banner: ไม่เกิน 2MB ความละเอียด 1920×1080 px (แนวนอน)'),
        bullet('รูปการ์ดสมาชิกทีมงาน: ความละเอียด 600×800 px (แนวตั้ง สัดส่วน 3:4)'),
        bullet('รูปสินค้า/บริการ: ไม่เกิน 1MB ความละเอียด 800×600 px'),
        bullet('นามสกุลที่รองรับ: .jpg, .jpeg, .png, .webp'),
        sp(),

        h2('ติดต่อขอความช่วยเหลือได้ที่ไหน?'),
        para('ติดต่อทีม Developer ผ่านช่องทางที่ตกลงไว้ พร้อมแนบ:'),
        bullet('คำอธิบายปัญหาโดยละเอียด'),
        bullet('ภาพ Screenshot แสดงปัญหา'),
        bullet('ขั้นตอนที่ทำก่อนเกิดปัญหา'),
        sp(),
      ],
    },
  ],
})

// ─── WRITE FILE ───────────────────────────────────────────────────────────────
Packer.toBuffer(doc)
  .then((buffer) => {
    const outFile = 'SK-Sport_CMS_Guide_TH_Updated.docx'
    fs.writeFileSync(outFile, buffer)
    console.log(`\n✅  สร้างไฟล์สำเร็จ: ${outFile}`)
    console.log(`    ขนาด: ${(buffer.length / 1024).toFixed(1)} KB\n`)
  })
  .catch((err) => {
    console.error('\n❌  เกิดข้อผิดพลาด:', err.message || err)
    process.exit(1)
  })

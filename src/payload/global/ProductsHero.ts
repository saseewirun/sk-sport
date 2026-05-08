import { GlobalConfig } from 'payload'

export const ProductsHero: GlobalConfig = {
  slug: 'products-hero',
  admin: {
    group: 'Page Heroes',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'heroTitle',
      label: 'หัวข้อหลักหน้า Products (แบนเนอร์)',
      type: 'text',
    },
    {
      name: 'heroSubtitle',
      label: 'คำอธิบายใต้หัวข้อ (แบนเนอร์)',
      type: 'text',
    },
    {
      name: 'eyebrow',
      label: 'ข้อความเหนือหัวข้อ (Eyebrow)',
      type: 'text',
      admin: {
        description:
          'ข้อความขนาดเล็กที่แสดงเหนือหัวข้อหลัก เช่น ชื่อหมวดหมู่ หากเว้นว่างจะใช้ค่าเริ่มต้น “Equipment & Gear”',
      },
    },
    {
      name: 'titleFontSize',
      label: 'ขนาดหัวข้อแบนเนอร์ (px)',
      type: 'number',
      required: false,
      defaultValue: 56,
      min: 32,
      max: 96,
    },
    {
      name: 'subtitleFontSize',
      label: 'ขนาดคำอธิบายแบนเนอร์ (px)',
      type: 'number',
      defaultValue: 20,
      min: 14,
      max: 32,
    },
    {
      name: 'categoryTitleFontSize',
      label: 'ขนาดหัวข้อหมวดหมู่สินค้า (px)',
      type: 'number',
      defaultValue: 32,
      min: 20,
      max: 56,
      admin: {
        description: 'หัวข้อแถวหมวดหมู่ เช่น “BASKETBALL EQUIPMENT” ในหน้ารายการสินค้า',
      },
    },
    {
      name: 'productCardTitleFontSize',
      label: 'ขนาดชื่อสินค้าบนการ์ด (px)',
      type: 'number',
      defaultValue: 22,
      min: 14,
      max: 36,
      admin: {
        description: 'ชื่อสินค้าบนการ์ดในกริดและรายการสินค้า',
      },
    },
    {
      name: 'productPriceFontSize',
      label: 'ขนาดราคาสินค้า (px)',
      type: 'number',
      defaultValue: 16,
      min: 12,
      max: 28,
      admin: {
        description: 'ขนาดตัวเลขราคาบนการ์ดและรายการสินค้า',
      },
    },
    {
      name: 'detailTitleFontSize',
      label: 'ขนาดชื่อสินค้า — หน้ารายละเอียด (px)',
      type: 'number',
      defaultValue: 56,
      min: 32,
      max: 96,
      admin: {
        description: 'ชื่อหลักของสินค้าบนหน้ารายละเอียด',
      },
    },
    {
      name: 'detailSubtitleFontSize',
      label: 'ขนาดชื่อรองสินค้า — หน้ารายละเอียด (px)',
      type: 'number',
      defaultValue: 18,
      min: 14,
      max: 32,
      admin: {
        description: 'ชื่อรองของสินค้าบนหน้ารายละเอียด',
      },
    },
    {
      name: 'detailSectionTitleFontSize',
      label: 'ขนาดหัวข้อ “รายละเอียดสินค้า” (px)',
      type: 'number',
      defaultValue: 28,
      min: 20,
      max: 48,
      admin: {
        description: 'หัวข้อส่วนคำอธิบายสินค้าบนหน้ารายละเอียด',
      },
    },
    {
      name: 'detailBodyFontSize',
      label: 'ขนาดเนื้อหาคำอธิบายสินค้า (px)',
      type: 'number',
      defaultValue: 16,
      min: 14,
      max: 24,
      admin: {
        description: 'ข้อความคำอธิบายสินค้าบนหน้ารายละเอียด',
      },
    },
    {
      name: 'relatedTitleFontSize',
      label: 'ขนาดหัวข้อ “สินค้าที่คุณอาจสนใจ” (px)',
      type: 'number',
      defaultValue: 28,
      min: 20,
      max: 48,
      admin: {
        description: 'หัวข้อเหนือรายการสินค้าที่เกี่ยวข้องบนหน้ารายละเอียด',
      },
    },
    {
      name: 'heroMedia',
      label: 'รูปภาพแบนเนอร์',
      type: 'relationship',
      relationTo: 'hero-media',
      hasMany: true,
    },
  ],
}

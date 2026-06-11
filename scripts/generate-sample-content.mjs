/**
 * scripts/generate-sample-content.mjs
 *
 * Generates SAMPLE content files in content/ so the site can be developed and
 * built without the real Supabase export. Shapes match payload-types exactly.
 *
 * ⚠️ These are placeholders. Running the real export
 * (scripts/export-from-payload.mjs) overwrites them with customer data.
 *
 * Run: node scripts/generate-sample-content.mjs
 */

import { mkdirSync, writeFileSync } from 'fs'
import path from 'path'

const ROOT = process.cwd()
const NOW = '2026-06-01T00:00:00.000Z'
const EARLIER = '2026-05-01T00:00:00.000Z'

let idCounter = 0
const uid = () => `sample-${String(++idCounter).padStart(4, '0')}`

/** Media doc matching HeroMedia/GalleryMedia/ServiceMedia shape, url = public asset. */
const media = (url, alt) => ({
  id: uid(),
  alt,
  prefix: null,
  updatedAt: NOW,
  createdAt: NOW,
  url,
  thumbnailURL: null,
  filename: url.split('/').pop(),
  mimeType: 'image/png',
  filesize: null,
  width: null,
  height: null,
  focalX: null,
  focalY: null,
})

/** PartnerMedia uses `name` instead of `alt`. */
const partnerMedia = (url, name) => {
  const m = media(url, name)
  delete m.alt
  return { ...m, name }
}

const lexical = (text) => ({
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        version: 1,
        children: [{ type: 'text', text, version: 1 }],
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
})

// ── Globals ─────────────────────────────────────────────────────────────────

const globals = {
  home: {
    id: uid(),
    heroMedia: [media('/Contact Section BG Desktop.png', 'SK Sport hero banner')],
    galleryMedia: [
      media('/gallery-1.png', 'แกลเลอรีผลงาน 1'),
      media('/gallery-2.png', 'แกลเลอรีผลงาน 2'),
      media('/gallery-3.png', 'แกลเลอรีผลงาน 3'),
      media('/gallery-5.png', 'แกลเลอรีผลงาน 5'),
    ],
    partners: [
      partnerMedia('/Partners/LifeFitness.png', 'Life Fitness'),
      partnerMedia('/Partners/NordicTrack.png', 'NordicTrack'),
      partnerMedia('/Partners/Precor.png', 'Precor'),
      partnerMedia('/Partners/Cybex.png', 'Cybex'),
    ],
    heroTitleFontSize: null,
    heroSubtitleFontSize: null,
    sectionTitleFontSize: null,
    highlightTitleFontSize: null,
    highlightBodyFontSize: null,
    cardTitleFontSize: null,
    cardBodyFontSize: null,
    updatedAt: NOW,
    createdAt: EARLIER,
  },

  about: {
    id: uid(),
    heroTitle: 'เกี่ยวกับเรา (ตัวอย่าง)',
    heroSubtitle: 'SK Sport Trading — ผู้เชี่ยวชาญด้านอุปกรณ์กีฬาครบวงจร',
    historySectionTitle: 'ประวัติบริษัท',
    companyName: 'SK Sport Trading',
    historyDescription:
      'ข้อความตัวอย่าง: บริษัทดำเนินธุรกิจติดตั้งอุปกรณ์กีฬาและฟิตเนสครบวงจร\nข้อมูลจริงจะมาจากการ export ฐานข้อมูลลูกค้า',
    historyHighlights: [
      { value: '10+', label: 'ปีประสบการณ์', id: uid() },
      { value: '100+', label: 'โครงการที่ส่งมอบ', id: uid() },
    ],
    missionTitle: 'พันธกิจ',
    missionDescription: 'ข้อความตัวอย่างพันธกิจ',
    visionTitle: 'วิสัยทัศน์',
    visionDescription: 'ข้อความตัวอย่างวิสัยทัศน์',
    founderSectionTitle: 'Team Member',
    founderImage: null,
    founderName: null,
    founderRole: null,
    founderDescription: null,
    founderQuote: null,
    featuredProjectsSectionTitle: null,
    featuredProjectsSectionSubtitle: null,
    featuredProjectsCtaText: null,
    servicesSectionTitle: null,
    servicesSectionSubtitle: null,
    servicesCtaText: null,
    productsSectionTitle: null,
    productsSectionSubtitle: null,
    productsCtaText: null,
    sectionTitleFontSize: null,
    highlightCardTitleFontSize: null,
    highlightCardBodyFontSize: null,
    statNumberFontSize: null,
    statLabelFontSize: null,
    missionVisionTitleFontSize: null,
    missionVisionBodyFontSize: null,
    videoSectionTitle: 'Video',
    videoSectionTitleFontSize: null,
    youtubeVideos: [],
    founderCardTitleFontSize: null,
    founderCardBodyFontSize: null,
    founderQuoteFontSize: null,
    founderDetailTitleFontSize: null,
    founderDetailBodyFontSize: null,
    updatedAt: NOW,
    createdAt: EARLIER,
  },

  'about-hero': {
    id: uid(),
    heroTitle: 'About Us (ตัวอย่าง)',
    heroSubtitle: 'รู้จักทีมงานและเรื่องราวของเรา',
    heroTitleFontSize: null,
    heroSubtitleFontSize: null,
    heroMedia: [media('/About Company BG.png', 'About hero')],
    updatedAt: NOW,
    createdAt: EARLIER,
  },

  'services-hero': {
    id: uid(),
    heroTitle: 'Our Services (ตัวอย่าง)',
    heroSubtitle: 'บริการติดตั้งอุปกรณ์กีฬาครบวงจร',
    heroTitleFontSize: null,
    heroSubtitleFontSize: null,
    serviceCardTitleFontSize: null,
    serviceCardBodyFontSize: null,
    detailHeroTitleFontSize: null,
    detailContentTitleFontSize: null,
    detailContentBodyFontSize: null,
    relatedHeadingFontSize: null,
    relatedItemTitleFontSize: null,
    heroMedia: [media('/services-hero.png', 'Services hero')],
    updatedAt: NOW,
    createdAt: EARLIER,
  },

  'portfolio-hero': {
    id: uid(),
    heroTitle: 'Our Portfolio (ตัวอย่าง)',
    heroSubtitle: 'ผลงานที่เราภูมิใจ',
    heroTitleFontSize: null,
    heroSubtitleFontSize: null,
    highlightsTitleFontSize: null,
    sectionTitleFontSize: null,
    cardTitleFontSize: null,
    detailHeroTitleFontSize: null,
    detailBodyFontSize: null,
    moreProjectsTitleFontSize: null,
    heroMedia: [],
    updatedAt: NOW,
    createdAt: EARLIER,
  },

  'products-hero': {
    id: uid(),
    heroTitle: 'Our Products (ตัวอย่าง)',
    heroSubtitle: 'อุปกรณ์กีฬาคุณภาพระดับโลก',
    eyebrow: null,
    titleFontSize: null,
    subtitleFontSize: null,
    categoryTitleFontSize: null,
    productCardTitleFontSize: null,
    productPriceFontSize: null,
    detailTitleFontSize: null,
    detailSubtitleFontSize: null,
    detailSectionTitleFontSize: null,
    detailBodyFontSize: null,
    relatedTitleFontSize: null,
    heroMedia: [],
    updatedAt: NOW,
    createdAt: EARLIER,
  },

  'contact-hero': {
    id: uid(),
    heroTitle: 'Contact Us (ตัวอย่าง)',
    heroSubtitle: 'ติดต่อทีมงานของเรา',
    heroTitleFontSize: null,
    heroSubtitleFontSize: null,
    contactSectionTitleFontSize: null,
    contactInfoTitleFontSize: null,
    contactInfoBodyFontSize: null,
    formLabelFontSize: null,
    formInputFontSize: null,
    googleMapEmbedUrl: null,
    heroMedia: [media('/Contact Section BG Desktop.png', 'Contact hero')],
    updatedAt: NOW,
    createdAt: EARLIER,
  },

  faq: {
    id: uid(),
    heroTitle: 'Frequently Asked Questions',
    heroSubtitle: 'คำถามที่พบบ่อย (ตัวอย่าง)',
    heroTitleFontSize: null,
    heroSubtitleFontSize: null,
    questionFontSize: null,
    answerFontSize: null,
    bottomCtaTitleFontSize: null,
    bottomCtaBodyFontSize: null,
    bottomCtaBody: null,
    faqItems: [
      {
        question: 'นี่คือข้อมูลตัวอย่างใช่ไหม?',
        answer: 'ใช่ — ข้อมูลจริงจะถูกแทนที่เมื่อรัน export จากฐานข้อมูลลูกค้า',
        id: uid(),
      },
      {
        question: 'รับติดตั้งอุปกรณ์กีฬาประเภทใดบ้าง?',
        answer: 'ตัวอย่างคำตอบ: ฟิตเนส ยิมนาสติก สนามกีฬาในร่ม และอื่นๆ',
        id: uid(),
      },
    ],
    updatedAt: NOW,
    createdAt: EARLIER,
  },

  'privacy-policy': {
    id: uid(),
    heroTitle: 'Privacy Policy',
    lastUpdated: 'June 2026',
    content: lexical('ข้อความตัวอย่างนโยบายความเป็นส่วนตัว — ข้อมูลจริงมาจาก export'),
    updatedAt: NOW,
    createdAt: EARLIER,
  },

  'terms-of-service': {
    id: uid(),
    heroTitle: 'Terms & Conditions',
    lastUpdated: 'June 2026',
    content: lexical('ข้อความตัวอย่างข้อกำหนดการใช้งาน — ข้อมูลจริงมาจาก export'),
    updatedAt: NOW,
    createdAt: EARLIER,
  },

  'payment-settings': {
    id: uid(),
    isEnabled: true,
    orderNotificationEmail: null,
    bankName: 'ธนาคารตัวอย่าง',
    accountName: 'SK Sport Trading (ตัวอย่าง)',
    accountNumber: '000-0-00000-0',
    branch: null,
    paymentInstructions: 'โอนแล้วแนบสลิปในขั้นตอนถัดไป (ข้อความตัวอย่าง)',
    qrCodeImage: null,
    updatedAt: NOW,
    createdAt: EARLIER,
  },
}

// ── Collections ─────────────────────────────────────────────────────────────

const service = (title, slug, heroUrl, subtitle) => ({
  id: uid(),
  title,
  subtitle,
  hero: media(heroUrl, title),
  slug,
  sections: [
    {
      sectionTitle: `${title} — รายละเอียด (ตัวอย่าง)`,
      description: 'ข้อความตัวอย่างรายละเอียดบริการ ข้อมูลจริงมาจาก export',
      variant: 'row',
      images: null,
      image: media(heroUrl, title),
      alignment: 'left',
      id: uid(),
    },
  ],
  tags: [{ tag: 'sample', id: uid() }],
  updatedAt: NOW,
  createdAt: EARLIER,
})

const services = [
  service(
    'Integrated Sports Installation',
    'integrated-sports-installation',
    '/Service/Integrated Sports Installation.png',
    'ติดตั้งระบบกีฬาครบวงจร (ตัวอย่าง)',
  ),
  service(
    'Equipment for Top Gymnasts',
    'equipment-for-top-gymnasts',
    '/Service/Equipment for Top Gymnasts.png',
    'อุปกรณ์ยิมนาสติกระดับแข่งขัน (ตัวอย่าง)',
  ),
  service(
    'Sports Vision Training',
    'sports-vision-training',
    '/Service/Sports Vision Training.png',
    'ฝึกสายตานักกีฬา (ตัวอย่าง)',
  ),
  service(
    'Health Management System',
    'health-management-system',
    '/Service/Health Management System.png',
    'ระบบจัดการสุขภาพ (ตัวอย่าง)',
  ),
  service(
    'United Discovery',
    'united-discovery',
    '/Service/United Discovery.png',
    'United Discovery (ตัวอย่าง)',
  ),
]

const product = (title, slug, imageUrl, category) => ({
  id: uid(),
  title,
  subtitle: `${title} (ตัวอย่าง)`,
  category,
  mode: 'quote',
  price: null,
  description: `ข้อความตัวอย่างคำอธิบายสินค้า ${title} — ข้อมูลจริงมาจาก export`,
  image: media(imageUrl, title),
  slug,
  updatedAt: NOW,
  createdAt: EARLIER,
})

const products = [
  product(
    'Outdoor Exercise Equipment',
    'outdoor-exercise-equipment',
    '/outdoor-exercise-equipment.png',
    'Fitness',
  ),
  product('Gymnastic Equipment', 'gymnastic-equipment', '/gymnastic-equipment.png', 'Gymnastics'),
  product(
    'Integrated Sports Set',
    'integrated-sports-set',
    '/integrated-sports-installation.png',
    'Fitness',
  ),
]

const article = (title, slug, imageUrl, tag, createdAt) => ({
  id: uid(),
  title,
  subtitle: `${title} (ตัวอย่าง)`,
  highlight: true,
  sectionTitle: 'รายละเอียดโครงการ',
  sectionDetail: `ข้อความตัวอย่างรายละเอียดผลงาน ${title} — ข้อมูลจริงมาจาก export`,
  sectionImage: media(imageUrl, title),
  gallery: [media('/gallery-1.png', 'gallery 1'), media('/gallery-2.png', 'gallery 2')],
  tag,
  slug,
  updatedAt: NOW,
  createdAt,
})

const portfolioArticles = [
  article(
    'โครงการตัวอย่างที่ 1',
    'sample-project-1',
    '/portfolio-article-1.jpg',
    'Installation',
    NOW,
  ),
  article(
    'โครงการตัวอย่างที่ 2',
    'sample-project-2',
    '/portfolio-article-2.png',
    'Fitness',
    '2026-05-20T00:00:00.000Z',
  ),
  article(
    'โครงการตัวอย่างที่ 3',
    'sample-project-3',
    '/portfolio-article-3.png',
    'Gymnastics',
    EARLIER,
  ),
]

const founder = (name, slug, role, imageUrl, sortOrder) => ({
  id: uid(),
  name,
  slug,
  role,
  excerpt: `ข้อความแนะนำสั้นของ ${name} (ตัวอย่าง)`,
  description: `ประวัติฉบับเต็มของ ${name} (ตัวอย่าง) — ข้อมูลจริงมาจาก export`,
  quote: 'Push beyond limits. (ตัวอย่าง)',
  aboutImage: { relationTo: 'gallery-media', value: media(imageUrl, name) },
  gallery: [{ relationTo: 'gallery-media', value: media(imageUrl, name) }],
  sortOrder,
  isVisible: true,
  updatedAt: NOW,
  createdAt: EARLIER,
})

const founders = [
  founder('Saseewirun (ตัวอย่าง)', 'saseewirun-sample', 'Founder', '/gallery-1.png', 0),
  founder('Nattanat (ตัวอย่าง)', 'nattanat-sample', 'Team Member', '/gallery-2.png', 1),
]

const collections = {
  founders,
  services,
  products,
  'portfolio-articles': portfolioArticles,
}

// ── Write files ─────────────────────────────────────────────────────────────

const write = (rel, data) => {
  const file = path.join(ROOT, 'content', rel)
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
  console.log(`  ✓ content/${rel}`)
}

console.log('Generating SAMPLE content files…')
for (const [slug, doc] of Object.entries(globals)) write(`globals/${slug}.json`, doc)
for (const [slug, docs] of Object.entries(collections)) write(`collections/${slug}.json`, docs)
write('_export-manifest.json', {
  exportedAt: NOW,
  note: 'SAMPLE DATA generated by scripts/generate-sample-content.mjs — replace by running the real export',
})
console.log(
  'Done. ⚠️ SAMPLE data only — run scripts/export-from-payload.mjs for real customer data.',
)

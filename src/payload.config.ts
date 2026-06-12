import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { s3Storage } from '@payloadcms/storage-s3'

import { Users } from './payload/collections/Users'
import { HeroMedia } from './payload/collections/HeroMedia'
import { Home } from './payload/global/Home'
import { About } from './payload/global/About'
import { Faq } from './payload/global/Faq'
import { PrivacyPolicy } from './payload/global/PrivacyPolicy'
import { TermsOfService } from './payload/global/TermsOfService'
import { AboutHero } from './payload/global/AboutHero'
import { ServicesHero } from './payload/global/ServicesHero'
import { PortfolioHero } from './payload/global/PortfolioHero'
import { ProductsHero } from './payload/global/ProductsHero'
import { ContactHero } from './payload/global/ContactHero'
import { PaymentSettings } from './payload/global/PaymentSettings'
import { GalleryMedia } from './payload/collections/GalleryMedia'
import { ServiceMedia } from './payload/collections/ServiceMedia'
import { Services } from './payload/collections/Services'
import { EmailTests } from './payload/collections/EmailTests'
import { Contact } from './payload/collections/Contact'
import { PortfolioArticles } from './payload/collections/PortfolioArticles'
import { Products } from './payload/collections/Products'
import { PartnerMedia } from './payload/collections/PartnerMedia'
import { Founders } from './payload/collections/Founders'
import { PaymentSlips } from './payload/collections/PaymentSlips'
import { Orders } from './payload/collections/Orders'
import { QuoteRequests } from './payload/collections/QuoteRequests'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    HeroMedia,
    GalleryMedia,
    ServiceMedia,
    Services,
    EmailTests,
    Contact,
    PortfolioArticles,
    Products,
    PartnerMedia,
    Founders,
    PaymentSlips,
    Orders,
    QuoteRequests,
  ],
  globals: [
    Home,
    About,
    Faq,
    PrivacyPolicy,
    TermsOfService,
    AboutHero,
    ServicesHero,
    PortfolioHero,
    ProductsHero,
    ContactHero,
    PaymentSettings,
  ],
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'ไทย', code: 'th' },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    schemaName: 'payload',
    idType: 'uuid',
    push: false,
  }),
  sharp,
  plugins: [
    s3Storage({
      collections: {
        'hero-media': { prefix: 'hero-media' },
        'gallery-media': { prefix: 'gallery-media' },
        'service-media': { prefix: 'service-media' },
        'partner-media': { prefix: 'partner-media' },
        'payment-slips': { prefix: 'payment-slips' },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || '',
        endpoint: process.env.S3_ENDPOINT,
      },
    }),
  ],
  email: resendAdapter({
    apiKey: process.env.RESEND_API_KEY || '',
    defaultFromAddress: process.env.EMAIL_FROM || '',
    defaultFromName: process.env.EMAIL_FROM_NAME || '',
  }),
})

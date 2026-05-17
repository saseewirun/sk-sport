import type { CollectionConfig } from 'payload'
import { sanitizeFilename } from '@/utils/sanitizeFilename'

export const PartnerMedia: CollectionConfig = {
  slug: 'partner-media',
  admin: {
    group: 'Media',
    useAsTitle: 'name',
    description:
      'โลโก้พาร์ทเนอร์ — แนะนำขนาด 400×200 px พื้นหลังโปร่งใส (PNG) หรือสีขาว (ระบบบีบอัดให้อัตโนมัติ)',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeOperation: [
      async ({ args, operation }) => {
        if ((operation === 'create' || operation === 'update') && args.req?.file) {
          args.req.file.name = sanitizeFilename(args.req.file.name)
        }
        return args
      },
    ],
  },
  upload: {
    resizeOptions: { width: 400, height: 200, fit: 'inside', withoutEnlargement: true },
    formatOptions: {
      format: 'webp',
      options: {
        quality: 85,
      },
    },
  },
  fields: [
    {
      name: 'name',
      label: 'Partner name',
      type: 'text',
      required: true,
      admin: {
        description: 'Shown in admin and used as logo alt text.',
      },
    },
  ],
}

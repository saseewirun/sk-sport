import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Admin',
  },
  auth: true,
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'master') return true
      return { id: { equals: user.id } }
    },
    create: ({ req: { user } }) => user?.role === 'master',
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'master') return true
      return { id: { equals: user.id } }
    },
    delete: ({ req: { user } }) => user?.role === 'master',
  },
  fields: [
    {
      name: 'role',
      label: 'บทบาท',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      options: [
        { label: 'Master (ผู้ดูแลหลัก)', value: 'master' },
        { label: 'Editor (ผู้แก้ไขเนื้อหา)', value: 'editor' },
      ],
      access: {
        create: ({ req: { user } }) => user?.role === 'master',
        update: ({ req: { user } }) => user?.role === 'master',
      },
      admin: {
        description:
          'เฉพาะ Master เท่านั้นที่แก้ไขบทบาทได้ — หากต้องการเปลี่ยนบัญชี Master ต้องให้ Dev แก้โดยตรงในโค้ดเท่านั้น',
      },
    },
  ],
}

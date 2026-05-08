import type { CollectionConfig } from 'payload'

type UserWithRole = { id: string; role?: string | null }

const isMaster = (user: unknown): boolean => {
  const u = user as UserWithRole | null | undefined
  return u?.role === 'master'
}

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
      if (isMaster(user)) return true
      return { id: { equals: (user as UserWithRole).id } }
    },
    create: ({ req: { user } }) => isMaster(user),
    update: ({ req: { user } }) => {
      if (!user) return false
      if (isMaster(user)) return true
      return { id: { equals: (user as UserWithRole).id } }
    },
    delete: ({ req: { user } }) => isMaster(user),
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
        create: ({ req: { user } }) => isMaster(user),
        update: ({ req: { user } }) => isMaster(user),
      },
      admin: {
        description:
          'เฉพาะ Master เท่านั้นที่แก้ไขบทบาทได้ — หากต้องการเปลี่ยนบัญชี Master ต้องให้ Dev แก้โดยตรงในโค้ดเท่านั้น',
      },
    },
  ],
}

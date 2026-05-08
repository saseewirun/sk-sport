import type { GlobalConfig } from 'payload'

export const PaymentSettings: GlobalConfig = {
  slug: 'payment-settings',
  label: 'Payment settings',
  admin: {
    group: 'Checkout',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'isEnabled',
      type: 'checkbox',
      defaultValue: true,
      label: 'เปิดใช้งานการชำระเงินผ่านการโอนเงิน',
    },
    {
      name: 'orderNotificationEmail',
      type: 'email',
      label: 'อีเมลรับแจ้งเตือนออเดอร์',
      admin: {
        description:
          'อีเมลที่จะได้รับการแจ้งเตือนเมื่อมีออเดอร์ใหม่ หากเว้นว่างระบบจะใช้ค่า ORDER_NOTIFY_EMAIL หรืออีเมลสำรองของธุรกิจ',
      },
    },
    {
      name: 'bankName',
      type: 'text',
      label: 'ชื่อธนาคาร',
    },
    {
      name: 'accountName',
      type: 'text',
      label: 'ชื่อบัญชี',
    },
    {
      name: 'accountNumber',
      type: 'text',
      label: 'เลขที่บัญชี',
    },
    {
      name: 'branch',
      type: 'text',
      label: 'สาขา',
    },
    {
      name: 'paymentInstructions',
      type: 'textarea',
      label: 'คำแนะนำการชำระเงิน',
    },
    {
      name: 'qrCodeImage',
      type: 'relationship',
      relationTo: 'gallery-media',
      hasMany: false,
      label: 'รูป QR Code (ไม่บังคับ)',
    },
  ],
}

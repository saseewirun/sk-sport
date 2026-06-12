import siteContact from '../../content/globals/site-contact.json'

/**
 * Public-facing contact details — backed by content/globals/site-contact.json
 * so the customer edits them from the admin (หน้า ติดต่อเรา) like any other
 * content. Imported as JSON so it works in both server and client components;
 * the shape re-exported here keeps every existing consumer unchanged.
 */
export const CONTACT = {
  phone: siteContact.phone,
  phone2: (siteContact as { phone2?: string | null }).phone2 || null,
  email: siteContact.email,
  address: siteContact.address,
  mapEmbedSrc: siteContact.mapEmbedSrc,
} as const

export const SOCIAL_URLS: {
  facebook: string | null
  youtube: string | null
  line: string | null
} = {
  facebook: siteContact.facebook || null,
  youtube: siteContact.youtube || null,
  line: siteContact.line || null,
}

/**
 * Sanitize filename for S3 compatibility.
 * Removes non-ASCII characters, spaces, and special characters.
 */
export function sanitizeFilename(original: string): string {
  const lastDot = original.lastIndexOf('.')
  const ext = lastDot !== -1 ? original.slice(lastDot + 1) : ''
  const base = lastDot !== -1 ? original.slice(0, lastDot) : original

  const clean = base
    .replace(/[^\x20-\x7E]/g, '') // remove non-ASCII
    .replace(/[^\w\s.-]/g, '') // keep word chars, spaces, dots, hyphens
    .replace(/\s+/g, '-') // spaces to hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
    .trim()

  const safeName = clean || `file-${Date.now()}`
  return ext ? `${safeName}.${ext}` : safeName
}

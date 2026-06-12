import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

/**
 * Best-effort on-demand ISR revalidation.
 *
 * Called from Payload `afterChange` / `afterDelete` hooks so that editing
 * content in the admin refreshes the static public pages immediately, instead
 * of waiting for the time-based `revalidate` window.
 *
 * Notes:
 * - `next/cache` is imported dynamically so this module stays loadable from the
 *   standalone Payload CLI / migration scripts (which run outside Next.js).
 * - Wrapped in try/catch: when a mutation happens outside a Next request scope
 *   (e.g. during `next build` or a seed script) `revalidatePath` is a no-op and
 *   the time-based ISR fallback still keeps content fresh.
 * - Revalidates the whole route tree (`'/', 'layout'`) — the site is small, and
 *   most content is shared across pages (nav, footer, FAQ chatbot).
 */
async function revalidateSite(): Promise<void> {
  try {
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')
  } catch (err) {
    // Outside a Next.js request scope (CLI/build/seed) — safe to ignore.
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[revalidate] skipped:', (err as Error)?.message)
    }
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = async ({ doc }) => {
  await revalidateSite()
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  await revalidateSite()
  return doc
}

export const revalidateGlobalAfterChange: GlobalAfterChangeHook = async ({ doc }) => {
  await revalidateSite()
  return doc
}

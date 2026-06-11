import { describe, it, expect } from 'vitest'

import { loadCollection, loadGlobal } from '@/lib/contentStore'
import type { Product, PortfolioArticle } from '@/payload-types'

/**
 * The site is fully static: every page reads from content/*.json committed in
 * the repo. These tests assert the exported content the build depends on is
 * present and well-formed — no database, no Payload runtime.
 */
describe('content store', () => {
  it('loads the home global', () => {
    const home = loadGlobal<Record<string, unknown>>('home')
    expect(home).toBeDefined()
    expect(home).toHaveProperty('heroMedia')
  })

  it('loads products with valid slugs', () => {
    const products = loadCollection<Product>('products')
    expect(products.length).toBeGreaterThan(0)
    for (const p of products) {
      expect(p.slug).toBeTruthy()
    }
  })

  it('portfolio slugs contain no characters that break static builds', () => {
    const articles = loadCollection<PortfolioArticle>('portfolio-articles')
    expect(articles.length).toBeGreaterThan(0)
    // Windows-invalid filename characters would break `next build` prerender
    // output — the data layer sanitizes them (see src/data/portfolio.ts).
    for (const a of articles) {
      expect(a.slug ?? '').not.toMatch(/[<>:"\\?*]/)
    }
  })
})

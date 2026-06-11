import { getPrivacyPolicyGlobal } from '@/data/privacyPolicy'
import { CmsRichText } from '@/components/common/cmsRichText'
import type { SerializedEditorState } from 'lexical'

const DEFAULT_HERO_TITLE = 'Privacy Policy'

export default async function PrivacyPolicyPage() {
  const doc = await getPrivacyPolicyGlobal()
  const heroTitle = doc.heroTitle?.trim() || DEFAULT_HERO_TITLE
  const lastUpdated = doc.lastUpdated?.trim()
  const content = doc.content as SerializedEditorState | null | undefined

  return (
    <main className="flex w-full flex-col items-center">
      <section className="section-bg-to-right w-full py-16 md:py-24">
        <div className="relative z-10 container mx-auto px-6">
          <h1 className="text-primary-content">{heroTitle}</h1>
          {lastUpdated ? (
            <p className="body-lg text-primary-content/80 mt-3">Last updated: {lastUpdated}</p>
          ) : null}
        </div>
      </section>

      <section className="w-full bg-header-bg">
        <div className="container mx-auto px-6 py-12 md:py-20 max-w-3xl">
          <div className="flex flex-col gap-10 text-base-content">
            <CmsRichText data={content} className="body-md text-subtle leading-relaxed space-y-4" />
          </div>
        </div>
      </section>
    </main>
  )
}

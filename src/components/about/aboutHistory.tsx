interface HistoryHighlight {
  value?: string | null
  label?: string | null
}

interface HistoryCard {
  title?: string | null
  description?: string | null
}

interface AboutHistoryProps {
  /** Retained for CMS compatibility; intro uses fixed "About Us" heading per layout. */
  historySectionTitle?: string | null
  companyName?: string | null
  /** Retained for CMS compatibility; description is presented via the cards below. */
  historyDescription?: string | null
  historyHighlights?: HistoryHighlight[] | null
  /** Editable intro cards; falls back to INTRO_CARDS when not provided by CMS. */
  historyCards?: HistoryCard[] | null
  sectionTitleFontSizePx: number
  highlightCardTitleFontSizePx: number
  highlightCardBodyFontSizePx: number
  statNumberFontSizePx: number
  statLabelFontSizePx: number
}

export const INTRO_CARDS = [
  {
    title: 'Authorized Global Brands',
    description:
      'Official distributor in Thailand for leading international sports science and equipment brands across gymnastics, athletics, basketball, outdoor fitness, and performance assessment.',
  },
  {
    title: 'Founder-Led Experience',
    description:
      'Led by Dr. Sasiwiral Kaenchanhom, a former Thai national athlete with deep experience in elite sport, management, and performance-focused organizations.',
  },
  {
    title: 'Science-Driven Expertise',
    description:
      'Built on sports science knowledge, practical field experience, and long-term partnerships with global manufacturers and trusted institutions.',
  },
  {
    title: 'Beyond Equipment',
    description:
      'Part of the United Group network, with extended capabilities in sports tourism and international field-trip programs through United Discovery Co., Ltd.',
  },
] as const

export default function AboutHistory({
  companyName,
  historyHighlights,
  historyCards,
  sectionTitleFontSizePx,
  highlightCardTitleFontSizePx,
  highlightCardBodyFontSizePx,
  statNumberFontSizePx,
  statLabelFontSizePx,
}: AboutHistoryProps) {
  const cards =
    historyCards && historyCards.length > 0
      ? historyCards.map((c) => ({
          title: c.title ?? '',
          description: c.description ?? '',
        }))
      : INTRO_CARDS
  return (
    <section className="w-full bg-header-bg pt-12 pb-6 md:pt-16 md:pb-8">
      <div className="container mx-auto flex flex-col items-center gap-5 px-6 md:gap-6">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2
            className="font-semibold tracking-wide text-base-content"
            style={{ fontSize: `${sectionTitleFontSizePx}px` }}
          >
            About Us
          </h2>
          <div className="h-0.5 w-12 rounded-full bg-gradient md:w-14" aria-hidden />
          {companyName && (
            <p className="text-base font-medium text-gradient md:text-lg">{companyName}</p>
          )}
        </div>

        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 md:flex-row md:items-stretch md:gap-4">
          {cards.map((card, index) => (
            <div
              key={`${card.title}-${index}`}
              className="relative transition-transform duration-200 md:flex-1 md:min-w-0 md:hover:-translate-y-1"
            >
              <div className="flex h-full flex-col gap-2 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 px-6 py-5 shadow-lg transition hover:shadow-xl">
                <h3
                  className="font-semibold text-base-content"
                  style={{ fontSize: `${highlightCardTitleFontSizePx}px` }}
                >
                  {card.title}
                </h3>
                <p
                  className="leading-relaxed text-base-content/75"
                  style={{ fontSize: `${highlightCardBodyFontSizePx}px` }}
                >
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {historyHighlights && historyHighlights.length > 0 && (
          <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {historyHighlights.map((item, index) => {
              if (!item.value && !item.label) return null
              return (
                <div
                  key={index}
                  className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border border-base-300/50 bg-primary-content px-6 py-6 text-center shadow-lg transition hover:shadow-xl md:min-h-32"
                >
                  {item.value && (
                    <span
                      className="font-semibold text-gradient"
                      style={{ fontSize: `${statNumberFontSizePx}px` }}
                    >
                      {item.value}
                    </span>
                  )}
                  {item.label && (
                    <span
                      className="leading-snug text-base-content/60"
                      style={{ fontSize: `${statLabelFontSizePx}px` }}
                    >
                      {item.label}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

interface YoutubeVideoItem {
  id?: string | null
  title?: string | null
  youtubeUrl?: string | null
  embedTitle?: string | null
}

interface AboutVideoSectionProps {
  videoSectionTitle?: string | null
  videoSectionTitleFontSizePx: number
  youtubeVideos?: YoutubeVideoItem[] | null
}

function toYouTubeEmbedUrl(raw: string): string | null {
  try {
    const url = new URL(raw.trim())
    const host = url.hostname.replace(/^www\./, '')

    // Already an embed URL
    if (host === 'youtube.com' && url.pathname.startsWith('/embed/')) {
      return raw.trim()
    }

    // youtube.com/watch?v=VIDEO_ID
    if (host === 'youtube.com' && url.pathname === '/watch') {
      const v = url.searchParams.get('v')
      if (v) return `https://www.youtube.com/embed/${v}`
    }

    // youtu.be/VIDEO_ID
    if (host === 'youtu.be') {
      const id = url.pathname.slice(1).split('?')[0]
      if (id) return `https://www.youtube.com/embed/${id}`
    }

    return null
  } catch {
    return null
  }
}

export default function AboutVideoSection({
  videoSectionTitle,
  videoSectionTitleFontSizePx,
  youtubeVideos,
}: AboutVideoSectionProps) {
  const validVideos = (youtubeVideos ?? [])
    .map((v) => ({
      id: v.id,
      title: v.title,
      embedTitle: v.embedTitle,
      embedUrl: v.youtubeUrl ? toYouTubeEmbedUrl(v.youtubeUrl) : null,
    }))
    .filter((v): v is typeof v & { embedUrl: string } => Boolean(v.embedUrl))

  if (validVideos.length === 0) return null

  const isSingle = validVideos.length === 1

  return (
    <section className="w-full bg-header-bg py-12 md:py-14">
      <div className="container mx-auto flex flex-col gap-8 px-6">
        {videoSectionTitle?.trim() && (
          <h2
            className="text-center font-semibold tracking-wide text-base-content"
            style={{ fontSize: `${videoSectionTitleFontSizePx}px` }}
          >
            {videoSectionTitle}
          </h2>
        )}

        <div
          className={
            isSingle ? 'mx-auto w-full max-w-3xl' : 'grid grid-cols-1 gap-6 md:grid-cols-2'
          }
        >
          {validVideos.map((v, i) => (
            <div key={v.id ?? i} className="flex flex-col gap-3">
              {v.title?.trim() && (
                <p className="text-sm font-medium text-base-content/70 md:text-base">{v.title}</p>
              )}
              <div className="relative w-full overflow-hidden rounded-xl aspect-video">
                <iframe
                  src={v.embedUrl}
                  title={v.embedTitle?.trim() || 'YouTube video'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

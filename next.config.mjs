import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

const isDev = process.env.NODE_ENV === 'development'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static site (Cloudflare Pages). `next dev` keeps the dynamic server
  // so the admin dev API (scripts/admin-dev-server.mjs) can be proxied below.
  ...(isDev ? {} : { output: 'export' }),
  images: {
    // Static export has no image optimizer; all media is served from /uploads.
    unoptimized: true,
  },
  ...(isDev
    ? {
        // In dev, /api/* is served by the local admin dev server which mirrors
        // the Cloudflare Pages Functions contract against the local filesystem.
        async rewrites() {
          return [{ source: '/api/:path*', destination: 'http://localhost:8788/api/:path*' }]
        },
      }
    : {}),
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withNextIntl(nextConfig)

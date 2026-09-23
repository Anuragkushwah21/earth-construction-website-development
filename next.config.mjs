/** @type {import('next').NextConfig} */
const nextConfig = {
  // Type errors should fail the build rather than ship silently.
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    // Cloudinary is the default remote image host; add others here if the
    // upload provider in lib/upload.ts changes.
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      // The prototype used /projects; the CMS uses /work.
      // `[^.]+` keeps this from shadowing static files such as
      // /projects/photo.png, which would otherwise redirect instead of serve.
      { source: '/projects', destination: '/work', permanent: true },
      { source: '/projects/:slug([^.]+)', destination: '/work/:slug', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig

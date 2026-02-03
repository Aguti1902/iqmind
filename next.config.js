/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  async headers() {
    return [
      {
        source: '/.well-known/apple-developer-merchantid-domain-association',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain',
          },
        ],
      },
      // Headers para archivos HTML estáticos (Sipay FastPay iframe)
      {
        source: '/:path*.html',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' https://*.sipay.es https://fonts.googleapis.com https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.sipay.es; style-src 'self' 'unsafe-inline' https://*.sipay.es https://fonts.googleapis.com; style-src-elem 'self' 'unsafe-inline' https://*.sipay.es https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com https://*.sipay.es; frame-src 'self' https://*.sipay.es; connect-src 'self' https://*.sipay.es; img-src 'self' data: https://*.sipay.es; frame-ancestors 'self' https://mindmetric.io https://*.mindmetric.io;",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig


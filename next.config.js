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
            value: "frame-ancestors 'self' https://mindmetric.io https://*.mindmetric.io; script-src 'self' 'unsafe-inline' https://sandbox.sipay.es https://live.sipay.es; frame-src 'self' https://sandbox.sipay.es https://live.sipay.es;",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig


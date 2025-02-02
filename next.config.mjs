/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  async headers() {
    return [
      {
        source: '/api/auth/verify',
        headers: [
          {
            key: 'x-middleware-prefetch',
            value: '0',
          },
        ],
      },
    ]
  },
}

export default nextConfig;

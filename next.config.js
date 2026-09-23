const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ['hostinnegar.com', 'server-hi-speed-iran.info']
  },
  async redirects() {
    return [
      {
        source: '/series',
        destination: '/',
        permanent: false,
      },
    ];
  },
};

module.exports = withPWA(nextConfig);

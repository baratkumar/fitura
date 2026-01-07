/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Fix for pg module in Next.js
      config.externals.push('pg', 'pg-native', 'tedious', 'pg-pool')
    }
    return config
  },
}

module.exports = nextConfig


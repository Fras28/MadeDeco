/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  images: {
    domains: ['madedeco.com.ar', 'acdn-us.mitiendanube.com'],
  },
}

module.exports = nextConfig

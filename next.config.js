/** @type {import('next').NextConfig} */
const nextConfig = {
  // Necesario para que Prisma funcione en Next.js App Router
  serverExternalPackages: ['@prisma/client', 'prisma'],
}

module.exports = nextConfig

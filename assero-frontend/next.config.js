/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove appDir since it's deprecated in Next.js 13+
  env: {
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL
  }
}

module.exports = nextConfig
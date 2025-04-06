import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:4004/api/v2/:path*' // Proxy to backend
            }
        ]
    },
    env: {
        NEXT_PUBLIC_API_BASE_URL: 'http://localhost:4004/api/v2' // Base URL for apiClient
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'telegram.coinbeats.xyz'
            }
        ]
    }
}

export default nextConfig

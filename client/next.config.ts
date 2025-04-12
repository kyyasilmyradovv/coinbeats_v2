import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return [
            {
                source: '/api/auth/:path*',
                destination: '/api/auth/:path*'
            },
            {
                source: '/api/:path*',
                destination: 'http://localhost:4004/api/v2/:path*',
                has: [
                    {
                        type: 'header',
                        key: 'x-nextjs-data',
                        value: '(?!)'
                    }
                ]
            }
        ]
    },
    env: {
        NEXT_PUBLIC_API_BASE_URL: 'https://coinbeats-v2.onrender.com/api/v2' // Base URL for apiClient
        // NEXT_PUBLIC_API_BASE_URL: 'http://localhost:4004/api/v2' // Base URL for apiClient
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

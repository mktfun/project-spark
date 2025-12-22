/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://tork-api:8000/:path*', // Docker internal network
            },
        ]
    },
}

module.exports = nextConfig

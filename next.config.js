/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    trailingSlash: true,
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

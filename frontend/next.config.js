/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "vodiy.ua",
            },
            {
                protocol: "http",
                hostname: "localhost",
                port: "3001",
            },
            {
                protocol: "http",
                hostname: "backend",
                port: "3001",
            },
        ],
    },

    // Proxy /images requests to backend
    // Use 'backend' hostname for Docker network, fallback to localhost for local dev
    async rewrites() {
        const backendUrl =
            process.env.BACKEND_INTERNAL_URL || "http://backend:3001";
        return [
            {
                source: "/images/:path*",
                destination: `${backendUrl}/images/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;

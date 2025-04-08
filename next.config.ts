import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // 开发环境，在服务端代理
    async rewrites() {
        return [
            {
                source: '/dwc/api/:path*',
                destination: 'http://localhost:9500/:path*', // 代理后的目标地址
            },
        ];
    },
};

export default nextConfig;

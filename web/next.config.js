/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')();
const nextConfig = {
  // output: 'export',
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  compress: true, // 启用压缩
  swcMinify: true, // 使用 SWC 进行最小化
  poweredByHeader: false, // 移除 X-Powered-By 头
  api: {
    bodyParser: {
      sizeLimit: '10mb', // 根据实际需求调整
    },
  },
};

module.exports = withNextIntl(nextConfig);

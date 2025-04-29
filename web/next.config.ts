import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // what URL segment your pages live under
  basePath: '/scafoldr-web',
  // where to load your _next assets from
  assetPrefix: '/scafoldr-web/',
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: 'canvas' }]; // required to make Konva & react-konva work
    return config;
  }
};

export default nextConfig;

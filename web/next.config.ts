import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: 'canvas' }]; // required to make Konva & react-konva work
    return config;
  }
};

export default nextConfig;

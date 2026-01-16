import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static exports if needed
  // output: 'export',

  // Turbopack configuration (silence lockfile warnings)
  turbopack: {},

  // Webpack configuration for GLSL shaders
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ['raw-loader'],
    });

    return config;
  },

  // Experimental features
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ['three', 'gsap', 'framer-motion'],
  },

  // Disable x-powered-by header
  poweredByHeader: false,

  // Compress responses
  compress: true,

  // React strict mode for development
  reactStrictMode: true,
};

export default nextConfig;

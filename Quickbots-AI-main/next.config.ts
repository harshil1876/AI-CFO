import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config, { isServer }) => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /@supabase\/realtime-js/,
        message:
          /Critical dependency: the request of a dependency is an expression/,
      },
    ];

    // Webpack configuration
    if (!isServer) {
      // For client-side, ensure Supabase is resolved from node_modules
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }

    return config;
  },
};

export default nextConfig;

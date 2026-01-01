import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bqagichlnwjpfjfntbmx.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        // Allow images from subdomain portfolios
        protocol: 'https',
        hostname: '*.poseandpoise.studio',
      },
    ],
  },
};

export default nextConfig;

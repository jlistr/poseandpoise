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
      {
        // Instagram CDN for profile pictures (Late API)
        protocol: 'https',
        hostname: 'scontent-iad3-2.cdninstagram.com',
      },
      {
        // Instagram CDN wildcard
        protocol: 'https',
        hostname: '*.cdninstagram.com',
      },
      {
        // TikTok CDN for profile pictures (Late API)
        protocol: 'https',
        hostname: '*.tiktokcdn-us.com',
      },
      {
        // TikTok CDN alternate
        protocol: 'https',
        hostname: '*.tiktokcdn.com',
      },
    ],
  },
};

export default nextConfig;

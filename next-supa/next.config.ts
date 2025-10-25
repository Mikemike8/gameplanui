/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Allow build to continue despite warnings
  },
};

export default nextConfig;

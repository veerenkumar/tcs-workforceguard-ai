/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["lucide-react"],
  // Allow rewrites if needed
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: "http://localhost:8000/api/v1/:path*",
      },
    ];
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export",
  images: {
    remotePatterns: [
      { hostname: "icons.duckduckgo.com", pathname: "/ip3/*.ico" },
      { hostname: "*", pathname: "/**" },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;

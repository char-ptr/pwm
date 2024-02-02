/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export",
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;

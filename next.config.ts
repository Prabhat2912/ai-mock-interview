/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https", // You can add 'http' too if needed
        hostname: "**", // Double asterisk allows any hostname
      },
    ],
  },
};

export default nextConfig;

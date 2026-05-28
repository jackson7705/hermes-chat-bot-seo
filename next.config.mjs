/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Produce a minimal standalone bundle for the Docker image.
  output: "standalone",
};

export default nextConfig;

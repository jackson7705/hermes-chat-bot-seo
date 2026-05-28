/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Produce a minimal standalone bundle for the Docker image.
  output: "standalone",
  // Next's standalone tracer doesn't always pick up pure-JS deps that are
  // imported transitively. bcryptjs is required at runtime by the credentials
  // provider; force-include it.
  experimental: {
    outputFileTracingIncludes: {
      "*": ["./node_modules/bcryptjs/**/*"],
    },
  },
};

export default nextConfig;

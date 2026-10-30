/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emits a self-contained server in .next/standalone for the Docker image
  output: "standalone",
  // Allows the filter/pagination smoke test to build into an isolated folder so
  // it never clobbers the real .next production build.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;

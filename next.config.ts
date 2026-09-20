import type { NextConfig } from "next";

/**
 * NEXT_PUBLIC_IMC se define vacía en .env (dev local)
 * y como "/imc" en el workflow de GitHub Actions (deploy).
 */
const isGitHubPages = !!process.env.NEXT_PUBLIC_IMC;

const nextConfig: NextConfig = {
  ...(isGitHubPages && {
    output: "export",
    basePath: process.env.NEXT_PUBLIC_IMC,
  }),

  images: {
    unoptimized: true,
  },
};

export default nextConfig;
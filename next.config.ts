import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",

  basePath: "/imc",

  images: {
    unoptimized: true,
  },
};

export default nextConfig;
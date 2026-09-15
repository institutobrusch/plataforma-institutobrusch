import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Fixa a raiz do Turbopack neste projeto (evita inferência errada por causa
  // de um package-lock.json solto em C:\Users\PC).
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;

import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Fixa a raiz do Turbopack neste projeto (evita inferência errada por causa
  // de um package-lock.json solto em C:\Users\PC).
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Imagens do Supabase Storage (logos, favicon, fotos editáveis no admin)
  // servidas via next/image precisam do host liberado.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
};

export default nextConfig;

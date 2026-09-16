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
  // O corpo de uma Server Action é limitado a 1MB por padrão. Uploads de imagem
  // (foto da Camila, logo, hero) passam disso e a Vercel corta o POST na borda
  // (413), mostrando "This page couldn't load". 4mb fica sob o teto rígido de
  // 4.5MB da Vercel; o ImageField ainda comprime a imagem no navegador antes.
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;

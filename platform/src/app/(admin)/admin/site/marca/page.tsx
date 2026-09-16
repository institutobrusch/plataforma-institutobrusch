import Link from "next/link";
import { getConteudo, imagemUrl } from "@/lib/site/content";
import MarcaForm from "@/components/admin/site/MarcaForm";

export const metadata = { title: "Marca & Contatos — Admin" };

export default async function Page() {
  const marca = await getConteudo("marca");
  return (
    <div className="max-w-4xl">
      <Link href="/admin/site" className="text-sm text-ink-2 transition hover:text-ink">← Voltar</Link>
      <h1 className="mt-2 text-2xl text-ink">Marca & Contatos</h1>
      <p className="mt-1 text-sm text-ink-2">Logos, favicon, rodapé e redes sociais.</p>
      <MarcaForm
        inicial={marca}
        logoGoldUrl={imagemUrl(marca.logoGoldPath, "/brand/logo-gold.png")}
        logoNavyUrl={imagemUrl(marca.logoNavyPath, "/brand/logo-navy.png")}
        faviconUrl={imagemUrl(marca.faviconPath, "/icon.png")}
      />
    </div>
  );
}

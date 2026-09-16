import Link from "next/link";
import { getConteudo, imagemUrl } from "@/lib/site/content";
import CamilaForm from "@/components/admin/site/CamilaForm";

export const metadata = { title: "Camila — Admin" };

export default async function Page() {
  const c = await getConteudo("camila");
  return (
    <div className="max-w-4xl">
      <Link href="/admin/site" className="text-sm text-ink-2 transition hover:text-ink">← Voltar</Link>
      <h1 className="mt-2 text-2xl text-ink">Camila</h1>
      <p className="mt-1 text-sm text-ink-2">Foto, resumo, formação, seções de texto, botões e SEO da página da Camila.</p>
      <CamilaForm inicial={c} fotoUrl={imagemUrl(c.fotoPath, "/fotos/camila-1.jpg")} />
    </div>
  );
}

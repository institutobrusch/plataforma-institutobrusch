import Link from "next/link";
import { getConteudo, imagemUrl } from "@/lib/site/content";
import InstitutoForm from "@/components/admin/site/InstitutoForm";

export const metadata = { title: "Instituto — Admin" };

export default async function Page() {
  const c = await getConteudo("instituto");
  return (
    <div className="max-w-4xl">
      <Link href="/admin/site" className="text-sm text-ink-2 transition hover:text-ink">← Voltar</Link>
      <h1 className="mt-2 text-2xl text-ink">Instituto</h1>
      <p className="mt-1 text-sm text-ink-2">Foto, texto de apresentação, frentes de atuação e SEO da página do Instituto.</p>
      <InstitutoForm inicial={c} fotoUrl={imagemUrl(c.fotoPath, "/fotos/camila-2.jpg")} />
    </div>
  );
}

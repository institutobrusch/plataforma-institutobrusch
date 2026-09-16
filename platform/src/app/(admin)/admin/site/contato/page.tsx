import Link from "next/link";
import { getConteudo } from "@/lib/site/content";
import ContatoForm from "@/components/admin/site/ContatoForm";

export const metadata = { title: "Contato — Admin" };

export default async function Page() {
  const c = await getConteudo("contato");
  return (
    <div className="max-w-4xl">
      <Link href="/admin/site" className="text-sm text-ink-2 transition hover:text-ink">← Voltar</Link>
      <h1 className="mt-2 text-2xl text-ink">Contato</h1>
      <p className="mt-1 text-sm text-ink-2">Eyebrow, título, canais de contato, texto de acesso e SEO.</p>
      <ContatoForm inicial={c} />
    </div>
  );
}

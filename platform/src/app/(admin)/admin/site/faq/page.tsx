import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getConteudo } from "@/lib/site/content";
import FaqForm from "@/components/admin/site/FaqForm";
import FaqSeoForm from "@/components/admin/site/FaqSeoForm";
import { excluirFaqItem } from "./actions";

export const metadata = { title: "FAQ — Admin" };

export default async function Page() {
  const seo = await getConteudo("faq");
  const supabase = await createClient();
  const { data } = await supabase.from("faq_items").select("*").order("ordem", { ascending: true });
  const itens = data ?? [];

  return (
    <div className="max-w-3xl">
      <Link href="/admin/site" className="text-sm text-ink-2 transition hover:text-ink">← Voltar</Link>
      <h1 className="mt-2 text-2xl text-ink">FAQ</h1>
      <p className="mt-1 text-sm text-ink-2">Perguntas frequentes e SEO da página.</p>

      <section className="mt-6 rounded-[10px] border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink">SEO da página</h2>
        <div className="mt-4"><FaqSeoForm inicial={seo} /></div>
      </section>

      <section className="mt-6 rounded-[10px] border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink">Novo item</h2>
        <div className="mt-4"><FaqForm /></div>
      </section>

      <ul className="mt-6 space-y-2">
        {itens.map((item) => (
          <li key={item.id} className="rounded-lg border border-line bg-surface p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink">{item.pergunta} <span className="text-xs text-ink-2">· {item.ativo ? "ativo" : "inativo"} · ordem {item.ordem ?? 0}</span></span>
              <form action={excluirFaqItem}>
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" className="text-xs text-red-600 hover:underline">Excluir</button>
              </form>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-ink-2">Editar</summary>
              <div className="mt-3">
                <FaqForm inicial={{ id: item.id, pergunta: item.pergunta ?? "", resposta: item.resposta ?? "", ordem: item.ordem ?? 0, ativo: item.ativo ?? true }} />
              </div>
            </details>
          </li>
        ))}
        {itens.length === 0 && <li className="text-sm text-ink-2">Nenhum item de FAQ.</li>}
      </ul>
    </div>
  );
}

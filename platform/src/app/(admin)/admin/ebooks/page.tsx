import { createClient } from "@/lib/supabase/server";
import EbookForm from "@/components/admin/EbookForm";
import { alternarAtivoEbook, excluirEbook } from "./actions";

export const metadata = { title: "E-books — Admin" };
const fmtBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function EbooksAdmin() {
  const supabase = await createClient();
  const { data: ebooks } = await supabase.from("ebooks").select("id, titulo, slug, descricao, preco, ativo").order("titulo");

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl text-ink">E-books</h1>
      <section className="mt-6 rounded-[10px] border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink">Novo e-book</h2>
        <div className="mt-4"><EbookForm /></div>
      </section>
      <ul className="mt-6 space-y-2">
        {(ebooks ?? []).map((eb) => (
          <li key={eb.id} className="rounded-lg border border-line bg-surface p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink">{eb.titulo} <span className="text-xs text-ink-2">· {fmtBRL.format(Number(eb.preco ?? 0))} · {eb.ativo ? "ativo" : "inativo"}</span></span>
              <div className="flex items-center gap-3">
                <form action={alternarAtivoEbook}>
                  <input type="hidden" name="id" value={eb.id} />
                  <input type="hidden" name="ativo" value={String(eb.ativo)} />
                  <button type="submit" className="text-xs text-ink-2 hover:underline">{eb.ativo ? "Desativar" : "Ativar"}</button>
                </form>
                <form action={excluirEbook}>
                  <input type="hidden" name="id" value={eb.id} />
                  <button type="submit" className="text-xs text-red-600 hover:underline">Excluir</button>
                </form>
              </div>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-ink-2">Editar</summary>
              <div className="mt-3"><EbookForm ebook={eb} /></div>
            </details>
          </li>
        ))}
        {(ebooks ?? []).length === 0 && <li className="text-sm text-ink-2">Nenhum e-book.</li>}
      </ul>
    </div>
  );
}

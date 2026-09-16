import { createClient } from "@/lib/supabase/server";
import ProdutoForm from "@/components/admin/ProdutoForm";
import { alternarAtivoProduto, excluirProduto } from "./actions";

export const metadata = { title: "Produtos — Admin" };
const fmtBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function ProdutosAdmin() {
  const supabase = await createClient();
  const { data: produtos } = await supabase.from("products").select("id, nome, slug, tipo, preco, ativo").order("nome");

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl text-ink">Produtos</h1>
      <section className="mt-6 rounded-[10px] border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink">Novo produto</h2>
        <div className="mt-4"><ProdutoForm /></div>
      </section>
      <ul className="mt-6 space-y-2">
        {(produtos ?? []).map((p) => (
          <li key={p.id} className="rounded-lg border border-line bg-surface p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink">{p.nome} <span className="text-xs text-ink-2">· {p.tipo} · {fmtBRL.format(Number(p.preco ?? 0))} · {p.ativo ? "ativo" : "inativo"}</span></span>
              <div className="flex items-center gap-3">
                <form action={alternarAtivoProduto}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="ativo" value={String(p.ativo)} />
                  <button type="submit" className="text-xs text-ink-2 hover:underline">{p.ativo ? "Desativar" : "Ativar"}</button>
                </form>
                <form action={excluirProduto}>
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" className="text-xs text-red-600 hover:underline">Excluir</button>
                </form>
              </div>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-ink-2">Editar</summary>
              <div className="mt-3"><ProdutoForm produto={{ ...p, preco: Number(p.preco ?? 0) }} /></div>
            </details>
          </li>
        ))}
        {(produtos ?? []).length === 0 && <li className="text-sm text-ink-2">Nenhum produto.</li>}
      </ul>
      <p className="mt-4 text-xs text-ink-2">Excluir um produto com clientes vinculados é bloqueado (aparece registrado na Auditoria). Desative-o em vez de excluir.</p>
    </div>
  );
}

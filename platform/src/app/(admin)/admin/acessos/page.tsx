import { createClient } from "@/lib/supabase/server";
import AcessoForm from "@/components/admin/AcessoForm";
import { removerAcesso } from "./actions";

export const metadata = { title: "Acessos — Admin" };

export default async function AcessosAdmin() {
  const supabase = await createClient();
  const [{ data: produtos }, { data: acessos }] = await Promise.all([
    supabase.from("products").select("id, nome").eq("ativo", true).order("nome"),
    supabase.from("user_products").select("id, status, origem, products(nome)").eq("status", "ativo").order("created_at", { ascending: false }).limit(100),
  ]);

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <AcessoForm produtos={produtos ?? []} />
      <div>
        <h1 className="text-2xl text-ink">Acessos ativos</h1>
        <ul className="mt-4 divide-y divide-line rounded-[10px] border border-line bg-surface">
          {(acessos ?? []).map((a) => {
            const prod = Array.isArray(a.products) ? a.products[0] : a.products;
            return (
              <li key={a.id} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-ink">{(prod as { nome: string } | null)?.nome ?? "—"} <span className="text-xs text-ink-2">· {a.origem}</span></span>
                <form action={removerAcesso}>
                  <input type="hidden" name="id" value={a.id} />
                  <button type="submit" className="text-xs text-red-600 hover:underline">Remover</button>
                </form>
              </li>
            );
          })}
          {(acessos ?? []).length === 0 && <li className="px-4 py-6 text-sm text-ink-2">Nenhum acesso ativo.</li>}
        </ul>
      </div>
    </div>
  );
}

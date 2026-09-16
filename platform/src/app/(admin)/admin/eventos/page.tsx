import { createClient } from "@/lib/supabase/server";
import EventoForm from "@/components/admin/EventoForm";
import { alternarAtivoEvento, excluirEvento } from "./actions";

export const metadata = { title: "Eventos — Admin" };
const fmtBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function EventosAdmin() {
  const supabase = await createClient();
  const { data: eventos } = await supabase
    .from("events").select("id, titulo, slug, descricao, data, local, tipo, preco, vagas, ativo").order("data", { ascending: false });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl text-ink">Eventos</h1>
      <section className="mt-6 rounded-[10px] border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink">Novo evento</h2>
        <div className="mt-4"><EventoForm /></div>
      </section>
      <ul className="mt-6 space-y-2">
        {(eventos ?? []).map((e) => (
          <li key={e.id} className="rounded-lg border border-line bg-surface p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink">{e.titulo} <span className="text-xs text-ink-2">· {e.data ?? "sem data"} · {fmtBRL.format(Number(e.preco ?? 0))} · {e.ativo ? "ativo" : "inativo"}</span></span>
              <div className="flex items-center gap-3">
                <form action={alternarAtivoEvento}>
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="ativo" value={String(e.ativo)} />
                  <button type="submit" className="text-xs text-ink-2 hover:underline">{e.ativo ? "Desativar" : "Ativar"}</button>
                </form>
                <form action={excluirEvento}>
                  <input type="hidden" name="id" value={e.id} />
                  <button type="submit" className="text-xs text-red-600 hover:underline">Excluir</button>
                </form>
              </div>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-ink-2">Editar</summary>
              <div className="mt-3"><EventoForm evento={e} /></div>
            </details>
          </li>
        ))}
        {(eventos ?? []).length === 0 && <li className="text-sm text-ink-2">Nenhum evento.</li>}
      </ul>
    </div>
  );
}

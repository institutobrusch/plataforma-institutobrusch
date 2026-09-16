import { createClient } from "@/lib/supabase/server";
import DepoimentoForm from "@/components/admin/DepoimentoForm";
import { excluirDepoimento } from "./actions";

export const metadata = { title: "Depoimentos — Admin" };

export default async function DepoimentosAdmin() {
  const supabase = await createClient();
  const { data: depos } = await supabase
    .from("testimonials")
    .select("id, nome, iniciais, contexto, tipo, texto, video_url, ordem, status")
    .order("ordem", { ascending: true });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl text-ink">Depoimentos</h1>
      <section className="mt-6 rounded-[10px] border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink">Novo depoimento</h2>
        <div className="mt-4"><DepoimentoForm /></div>
      </section>
      <ul className="mt-6 space-y-2">
        {(depos ?? []).map((d) => (
          <li key={d.id} className="rounded-lg border border-line bg-surface p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink">{d.nome ?? "(sem nome)"} <span className="text-xs text-ink-2">· {d.tipo} · {d.status} · ordem {d.ordem ?? 0}</span></span>
              <form action={excluirDepoimento}>
                <input type="hidden" name="id" value={d.id} />
                <button type="submit" className="text-xs text-red-600 hover:underline">Excluir</button>
              </form>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-ink-2">Editar</summary>
              <div className="mt-3"><DepoimentoForm depo={d} /></div>
            </details>
          </li>
        ))}
        {(depos ?? []).length === 0 && <li className="text-sm text-ink-2">Nenhum depoimento.</li>}
      </ul>
    </div>
  );
}

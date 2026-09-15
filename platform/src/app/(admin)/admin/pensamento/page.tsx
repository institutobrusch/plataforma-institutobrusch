import { createClient } from "@/lib/supabase/server";
import PensamentoForm from "@/components/admin/PensamentoForm";
import { excluirPensamento } from "./actions";
import { pensamentoVisivel } from "@/lib/admin/pensamento";

export const metadata = { title: "Pensamento diário — Admin" };

export default async function PensamentoAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_thoughts")
    .select("id, titulo, data, status, audio_path")
    .order("data", { ascending: false });
  const hoje = new Date().toISOString().slice(0, 10);
  const itens = data ?? [];

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <PensamentoForm />
      <div>
        <h1 className="text-2xl text-ink">Pensamentos</h1>
        <ul className="mt-4 divide-y divide-line rounded-[10px] border border-line bg-surface">
          {itens.map((p) => {
            const visivel = pensamentoVisivel(p, hoje);
            const rotulo = p.status === "rascunho" ? "Rascunho" : visivel ? "Publicado" : "Agendado";
            return (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{p.titulo}</p>
                  <p className="text-xs text-ink-2">{p.data} · {rotulo}{p.audio_path ? " · com áudio" : ""}</p>
                </div>
                <form action={excluirPensamento}>
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" className="text-xs text-red-600 hover:underline">Excluir</button>
                </form>
              </li>
            );
          })}
          {itens.length === 0 && <li className="px-4 py-6 text-sm text-ink-2">Nenhum pensamento ainda.</li>}
        </ul>
      </div>
    </div>
  );
}

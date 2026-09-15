import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CartaForm from "@/components/admin/CartaForm";
import SessaoForm from "@/components/admin/SessaoForm";
import MaterialForm from "@/components/admin/MaterialForm";
import { excluirSessao, excluirMaterial } from "./actions";

export const metadata = { title: "Carta do cliente — Admin" };

export default async function CartaClienteAdmin({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const supabase = await createClient();
  const { data: carta } = await supabase
    .from("carto_cartas").select("titulo, explicacao, topicos").eq("user_id", userId).limit(1).maybeSingle();

  const { data: sessoes } = await supabase
    .from("carto_sessions")
    .select("id, titulo, resumo, data, duracao, ordem, audio_path")
    .eq("user_id", userId)
    .order("ordem", { ascending: false });

  const { data: materiais } = await supabase
    .from("carto_materials")
    .select("id, titulo, tipo, session_id, url")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  const sessaoOpts = (sessoes ?? []).map((s) => ({ id: s.id, titulo: s.titulo }));

  return (
    <div className="max-w-3xl">
      <Link href="/admin/cartografia" className="text-sm text-ink-2 hover:underline">← Voltar aos clientes</Link>
      <h1 className="mt-2 text-2xl text-ink">Cartografia do cliente</h1>
      <div className="mt-6 space-y-8">
        <CartaForm
          userId={userId}
          titulo={carta?.titulo ?? ""}
          explicacao={carta?.explicacao ?? ""}
          topicos={carta?.topicos ?? []}
        />
        <section className="rounded-[10px] border border-line bg-surface p-6">
          <h2 className="font-semibold text-ink">Sessões</h2>
          <div className="mt-4 rounded-lg border border-dashed border-line p-4">
            <p className="mb-3 text-sm font-medium text-ink-2">Nova sessão</p>
            <SessaoForm userId={userId} />
          </div>
          <ul className="mt-4 space-y-2">
            {(sessoes ?? []).map((s) => (
              <li key={s.id} className="rounded-lg border border-line p-3">
                <details>
                  <summary className="flex cursor-pointer items-center justify-between text-sm text-ink">
                    <span>{s.titulo} <span className="text-xs text-ink-2">· ordem {s.ordem ?? 0}{s.audio_path ? " · com áudio" : ""}</span></span>
                  </summary>
                  <div className="mt-3">
                    <SessaoForm userId={userId} sessao={s} />
                    <form action={excluirSessao} className="mt-2">
                      <input type="hidden" name="user_id" value={userId} />
                      <input type="hidden" name="id" value={s.id} />
                      <button type="submit" className="text-xs text-red-600 hover:underline">Excluir sessão</button>
                    </form>
                  </div>
                </details>
              </li>
            ))}
            {(sessoes ?? []).length === 0 && <li className="text-sm text-ink-2">Nenhuma sessão ainda.</li>}
          </ul>
        </section>
        <section className="rounded-[10px] border border-line bg-surface p-6">
          <h2 className="font-semibold text-ink">Materiais</h2>
          <div className="mt-4 rounded-lg border border-dashed border-line p-4">
            <p className="mb-3 text-sm font-medium text-ink-2">Novo material</p>
            <MaterialForm userId={userId} sessoes={sessaoOpts} />
          </div>
          <ul className="mt-4 space-y-2">
            {(materiais ?? []).map((m) => (
              <li key={m.id} className="rounded-lg border border-line p-3">
                <details>
                  <summary className="flex cursor-pointer items-center justify-between text-sm text-ink">
                    <span>{m.titulo} <span className="text-xs text-ink-2">· {m.tipo ?? "—"}{m.session_id ? " · sessão" : " · carta"}</span></span>
                  </summary>
                  <div className="mt-3">
                    <MaterialForm userId={userId} sessoes={sessaoOpts} material={m} />
                    <form action={excluirMaterial} className="mt-2">
                      <input type="hidden" name="user_id" value={userId} />
                      <input type="hidden" name="id" value={m.id} />
                      <button type="submit" className="text-xs text-red-600 hover:underline">Excluir material</button>
                    </form>
                  </div>
                </details>
              </li>
            ))}
            {(materiais ?? []).length === 0 && <li className="text-sm text-ink-2">Nenhum material ainda.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}

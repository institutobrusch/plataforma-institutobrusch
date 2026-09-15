import { createClient } from "@/lib/supabase/server";
import { montarFilaModeracao } from "@/lib/admin/moderacao";
import { moderarPost, moderarDepoimento, moderarSugestao } from "./actions";

export const metadata = { title: "Moderação — Admin" };

function BotaoStatus({ action, id, status, children }: { action: (fd: FormData) => void; id: string; status: string; children: React.ReactNode }) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className="rounded-full border border-line px-3 py-1 text-xs text-ink transition hover:bg-tan-bg">{children}</button>
    </form>
  );
}

export default async function ModeracaoAdmin() {
  const supabase = await createClient();
  const [posts, depos, sugs] = await Promise.all([
    supabase.from("community_posts").select("id, texto, status, author_id").eq("status", "pendente").order("created_at", { ascending: true }),
    supabase.from("testimonials").select("id, nome, texto, status").eq("status", "pendente").order("id", { ascending: true }),
    supabase.from("suggestions").select("id, texto, status").eq("status", "pendente").order("created_at", { ascending: true }),
  ]);
  const fila = montarFilaModeracao({
    posts: (posts.data ?? []).map((p) => ({ id: p.id, status: p.status })),
    depoimentos: (depos.data ?? []).map((d) => ({ id: d.id, status: d.status ?? "pendente" })),
    sugestoes: (sugs.data ?? []).map((s) => ({ id: s.id, status: s.status ?? "pendente" })),
  });

  return (
    <div>
      <h1 className="text-2xl text-ink">Moderação <span className="text-base text-ink-2">({fila.total} pendentes)</span></h1>

      <section className="mt-6">
        <h2 className="font-semibold text-ink">Comunidade ({fila.posts})</h2>
        <ul className="mt-3 space-y-3">
          {(posts.data ?? []).map((p) => (
            <li key={p.id} className="rounded-[10px] border border-line bg-surface p-4">
              <p className="text-sm text-ink">{p.texto}</p>
              <div className="mt-3 flex gap-2">
                <BotaoStatus action={moderarPost} id={p.id} status="aprovado">Aprovar</BotaoStatus>
                <BotaoStatus action={moderarPost} id={p.id} status="recusado">Recusar</BotaoStatus>
              </div>
            </li>
          ))}
          {fila.posts === 0 && <li className="text-sm text-ink-2">Nada pendente.</li>}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-ink">Depoimentos ({fila.depoimentos})</h2>
        <ul className="mt-3 space-y-3">
          {(depos.data ?? []).map((d) => (
            <li key={d.id} className="rounded-[10px] border border-line bg-surface p-4">
              <p className="text-sm text-ink">{d.texto}</p>
              <p className="text-xs text-ink-2">— {d.nome ?? "anônimo"}</p>
              <div className="mt-3 flex gap-2">
                <BotaoStatus action={moderarDepoimento} id={d.id} status="aprovado">Aprovar</BotaoStatus>
                <BotaoStatus action={moderarDepoimento} id={d.id} status="recusado">Recusar</BotaoStatus>
              </div>
            </li>
          ))}
          {fila.depoimentos === 0 && <li className="text-sm text-ink-2">Nada pendente.</li>}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-ink">Sugestões ({fila.sugestoes})</h2>
        <ul className="mt-3 space-y-3">
          {(sugs.data ?? []).map((s) => (
            <li key={s.id} className="rounded-[10px] border border-line bg-surface p-4">
              <p className="text-sm text-ink">{s.texto}</p>
              <div className="mt-3 flex gap-2">
                <BotaoStatus action={moderarSugestao} id={s.id} status="lida">Marcar como lida</BotaoStatus>
                <BotaoStatus action={moderarSugestao} id={s.id} status="arquivada">Arquivar</BotaoStatus>
              </div>
            </li>
          ))}
          {fila.sugestoes === 0 && <li className="text-sm text-ink-2">Nada pendente.</li>}
        </ul>
      </section>
    </div>
  );
}

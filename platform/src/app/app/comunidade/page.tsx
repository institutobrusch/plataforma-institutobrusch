import { createClient } from "@/lib/supabase/server";
import PostBox from "@/components/PostBox";
import { curtir } from "./actions";

function tempoRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3.6e6);
  if (h < 1) return "agora há pouco";
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d} dia${d > 1 ? "s" : ""}`;
}

export default async function ComunidadeAppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: posts } = await supabase
    .from("community_posts")
    .select("id, texto, created_at, author_id, community_likes(count), community_comments(count)")
    .order("created_at", { ascending: false });

  const lista = posts ?? [];

  // Nomes dos autores (não há FK direta post→profiles, então buscamos à parte)
  const autorIds = [...new Set(lista.map((p) => p.author_id))];
  const nomes = new Map<string, string>();
  if (autorIds.length) {
    const { data: perfis } = await supabase
      .from("profiles")
      .select("id, nome")
      .in("id", autorIds);
    perfis?.forEach((p) => nomes.set(p.id, p.nome ?? "Membro"));
  }

  // Posts que EU curti
  const meusLikes = new Set<string>();
  if (user) {
    const { data } = await supabase
      .from("community_likes")
      .select("post_id")
      .eq("user_id", user.id);
    data?.forEach((l) => meusLikes.add(l.post_id));
  }

  const iniciais = (nome: string) =>
    nome.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div>
      <h1 className="text-2xl text-ink">Comunidade</h1>
      <p className="mt-1 text-sm text-ink-2">
        Um espaço para os membros trocarem experiências. Publicações passam por
        aprovação antes de aparecer para todos.
      </p>

      <div className="mt-6">
        <PostBox />
      </div>

      <div className="mt-6 space-y-4">
        {lista.length === 0 && (
          <p className="rounded-2xl border border-line bg-surface p-6 text-ink-2">
            Ainda não há publicações aprovadas. Seja o primeiro a compartilhar!
          </p>
        )}
        {lista.map((p) => {
          const nome = nomes.get(p.author_id) ?? "Membro";
          const likes = p.community_likes?.[0]?.count ?? 0;
          const comentarios = p.community_comments?.[0]?.count ?? 0;
          const curtido = meusLikes.has(p.id);
          return (
            <article key={p.id} className="rounded-2xl border border-line bg-surface p-5">
              <header className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-navy text-sm font-semibold text-surface">
                  {iniciais(nome)}
                </span>
                <div className="leading-tight">
                  <span className="block text-sm font-semibold text-ink">{nome}</span>
                  <span className="block text-xs text-ink-3">{tempoRelativo(p.created_at)}</span>
                </div>
              </header>
              <p className="mt-3 text-ink">{p.texto}</p>
              <div className="mt-4 flex items-center gap-6 text-sm text-ink-3">
                <form action={curtir}>
                  <input type="hidden" name="postId" value={p.id} />
                  <button
                    type="submit"
                    className={`inline-flex items-center gap-1.5 transition hover:text-navy ${
                      curtido ? "font-semibold text-navy" : ""
                    }`}
                  >
                    <span aria-hidden>{curtido ? "♥" : "♡"}</span> {likes}
                  </button>
                </form>
                <span className="inline-flex items-center gap-1.5">
                  <span aria-hidden>💬</span> {comentarios}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

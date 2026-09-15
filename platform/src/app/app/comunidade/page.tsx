"use client";
import { useState } from "react";
import { getComunidade, type ComunidadePostMock } from "@/content";

export default function ComunidadeAppPage() {
  const [posts, setPosts] = useState<ComunidadePostMock[]>(getComunidade());
  const [curtidos, setCurtidos] = useState<Record<string, boolean>>({});
  const [texto, setTexto] = useState("");
  const [aviso, setAviso] = useState(false);

  function publicar(e: React.FormEvent) {
    e.preventDefault();
    if (texto.trim().length < 3) return;
    // Moderação prévia: não entra no feed; fica "aguardando aprovação".
    setTexto("");
    setAviso(true);
    setTimeout(() => setAviso(false), 4000);
  }

  function curtir(id: string) {
    setCurtidos((c) => ({ ...c, [id]: !c[id] }));
    setPosts((ps) =>
      ps.map((p) =>
        p.id === id ? { ...p, likes: p.likes + (curtidos[id] ? -1 : 1) } : p,
      ),
    );
  }

  return (
    <div>
      <h1 className="text-2xl text-ink">Comunidade</h1>
      <p className="mt-1 text-sm text-ink-2">
        Um espaço para os membros trocarem experiências. Publicações passam por
        aprovação antes de aparecer para todos.
      </p>

      {/* Caixa de publicação */}
      <form onSubmit={publicar} className="mt-6 rounded-2xl border border-line bg-surface p-4">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={3}
          placeholder="Compartilhe algo com a comunidade…"
          className="w-full resize-none rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-ink-3">Sua publicação passará por moderação.</span>
          <button
            type="submit"
            className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-surface transition hover:bg-navy-d"
          >
            Publicar
          </button>
        </div>
        {aviso && (
          <p className="mt-2 rounded-lg bg-tan-bg px-3 py-2 text-sm text-navy">
            ✓ Enviado! Sua publicação aparecerá após aprovação da moderação.
          </p>
        )}
      </form>

      {/* Feed */}
      <div className="mt-6 space-y-4">
        {posts.map((p) => (
          <article key={p.id} className="rounded-2xl border border-line bg-surface p-5">
            <header className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-navy text-sm font-semibold text-surface">
                {p.iniciais}
              </span>
              <div className="leading-tight">
                <span className="block text-sm font-semibold text-ink">{p.autor}</span>
                <span className="block text-xs text-ink-3">{p.tempo}</span>
              </div>
            </header>
            <p className="mt-3 text-ink">{p.texto}</p>
            <div className="mt-4 flex items-center gap-6 text-sm text-ink-3">
              <button
                type="button"
                onClick={() => curtir(p.id)}
                className={`inline-flex items-center gap-1.5 transition hover:text-navy ${
                  curtidos[p.id] ? "font-semibold text-navy" : ""
                }`}
              >
                <span aria-hidden>{curtidos[p.id] ? "♥" : "♡"}</span> {p.likes}
              </button>
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden>💬</span> {p.comentarios}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

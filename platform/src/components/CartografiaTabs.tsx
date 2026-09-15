"use client";
import { useState } from "react";

type Aba = "carta" | "sessoes" | "materiais";

export type CartaView = { titulo: string; explicacao: string | null; topicos: string[] } | null;
export type SessaoView = { id: string; titulo: string; data: string | null; resumo: string | null; audioUrl?: string };
export type MaterialView = { id: string; titulo: string; tipo: string | null; sessao: string; url?: string };

export default function CartografiaTabs({
  carta,
  sessoes,
  materiais,
}: {
  carta: CartaView;
  sessoes: SessaoView[];
  materiais: MaterialView[];
}) {
  const [aba, setAba] = useState<Aba>("carta");
  const abas: { id: Aba; label: string }[] = [
    { id: "carta", label: "Minha carta" },
    { id: "sessoes", label: "Sessões" },
    { id: "materiais", label: "Materiais" },
  ];

  return (
    <div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <Stat n={String(sessoes.length)} l="Sessões" />
        <Stat n={`${carta?.topicos.length ?? 0} temas`} l="Na sua carta" />
        <Stat n={`${materiais.length}`} l="Materiais" />
      </div>

      <div className="mt-8 flex gap-2 border-b border-line">
        {abas.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setAba(a.id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              aba === a.id ? "border-navy text-navy" : "border-transparent text-ink-3 hover:text-ink"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {aba === "carta" &&
          (carta ? (
            <div className="grid gap-6 md:grid-cols-[300px_1fr]">
              <div className="flex aspect-square items-end rounded-2xl bg-gradient-to-br from-navy to-navy-d p-5">
                <span className="font-serif text-2xl italic text-white">{carta.titulo}</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-ink">{carta.titulo}</h2>
                {carta.explicacao && <p className="mt-2 text-ink-2">{carta.explicacao}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  {carta.topicos.map((t) => (
                    <span key={t} className="rounded-full bg-tan-bg px-3 py-1 text-sm font-medium text-navy">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-ink-2">Sua carta ainda está sendo preparada pela Camila.</p>
          ))}

        {aba === "sessoes" && (
          <div className="space-y-4">
            {sessoes.length === 0 && <p className="text-ink-2">Ainda não há sessões registradas.</p>}
            {sessoes.map((s) => (
              <article key={s.id} className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-ink">{s.titulo}</h3>
                  <span className="text-xs text-ink-3">{s.data}</span>
                </div>
                {s.audioUrl && <audio controls preload="none" className="mt-3 w-full" src={s.audioUrl} />}
                {s.resumo && <p className="mt-3 text-sm text-ink-2">{s.resumo}</p>}
              </article>
            ))}
          </div>
        )}

        {aba === "materiais" && (
          <div className="space-y-3">
            {materiais.length === 0 && <p className="text-ink-2">Ainda não há materiais disponíveis.</p>}
            {materiais.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface p-4">
                <div>
                  <div className="text-sm font-semibold text-ink">{m.titulo}</div>
                  <div className="text-xs text-ink-3">{m.sessao}</div>
                </div>
                {m.url ? (
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-navy px-4 py-2 text-sm font-semibold text-navy transition hover:bg-tan-bg"
                  >
                    {m.tipo ?? "Abrir"} · Abrir
                  </a>
                ) : (
                  <span className="text-xs text-ink-3">indisponível</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="text-lg font-semibold text-navy">{n}</div>
      <div className="text-xs uppercase tracking-wide text-ink-3">{l}</div>
    </div>
  );
}

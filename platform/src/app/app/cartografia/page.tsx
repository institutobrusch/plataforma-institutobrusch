"use client";
import { useState } from "react";
import AudioPlayerDemo from "@/components/AudioPlayerDemo";
import { getCarta, getSessoes } from "@/content";

type Aba = "carta" | "sessoes" | "materiais";

export default function CartografiaAppPage() {
  const carta = getCarta();
  const sessoes = getSessoes();
  const [aba, setAba] = useState<Aba>("carta");

  const materiais = sessoes.flatMap((s) =>
    s.materiais.map((m) => ({ ...m, sessao: s.titulo })),
  );

  const abas: { id: Aba; label: string }[] = [
    { id: "carta", label: "Minha carta" },
    { id: "sessoes", label: "Sessões" },
    { id: "materiais", label: "Materiais" },
  ];

  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-tan">
        Seu produto
      </span>
      <h1 className="mt-1 text-2xl text-ink">Cartografia</h1>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { n: String(sessoes.length), l: "Sessões" },
          { n: carta.topicos.length + " temas", l: "Na sua carta" },
          { n: "2 meses", l: "De jornada" },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border border-line bg-surface p-4">
            <div className="text-lg font-semibold text-navy">{s.n}</div>
            <div className="text-xs uppercase tracking-wide text-ink-3">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Abas */}
      <div className="mt-8 flex gap-2 border-b border-line">
        {abas.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setAba(a.id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              aba === a.id
                ? "border-navy text-navy"
                : "border-transparent text-ink-3 hover:text-ink"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {aba === "carta" && (
          <div className="grid gap-6 md:grid-cols-[300px_1fr]">
            <div className="flex aspect-square items-end rounded-2xl bg-gradient-to-br from-navy to-navy-d p-5">
              <span className="font-serif text-2xl italic text-white">{carta.titulo}</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink">{carta.titulo}</h2>
              <p className="mt-2 text-ink-2">{carta.explicacao}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {carta.topicos.map((t) => (
                  <span key={t} className="rounded-full bg-tan-bg px-3 py-1 text-sm font-medium text-navy">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {aba === "sessoes" && (
          <div className="space-y-4">
            {sessoes.map((s) => (
              <article key={s.titulo} className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-ink">{s.titulo}</h3>
                  <span className="text-xs text-ink-3">{s.data}</span>
                </div>
                <div className="mt-3">
                  <AudioPlayerDemo duracao={s.duracao} />
                </div>
                <p className="mt-3 text-sm text-ink-2">{s.resumo}</p>
                {s.materiais.length > 0 && (
                  <p className="mt-3 text-xs text-ink-3">
                    {s.materiais.length} material(is) — veja na aba “Materiais”.
                  </p>
                )}
              </article>
            ))}
          </div>
        )}

        {aba === "materiais" && (
          <div className="space-y-3">
            {materiais.length === 0 && (
              <p className="text-ink-2">Ainda não há materiais disponíveis.</p>
            )}
            {materiais.map((m, i) => (
              <div key={i} className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface p-4">
                <div>
                  <div className="text-sm font-semibold text-ink">{m.titulo}</div>
                  <div className="text-xs text-ink-3">{m.sessao}</div>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-navy px-4 py-2 text-sm font-semibold text-navy transition hover:bg-tan-bg"
                >
                  {m.tipo} · Abrir
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

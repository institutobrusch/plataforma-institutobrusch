import AudioPlayerDemo from "@/components/AudioPlayerDemo";
import { getPensamentos } from "@/content";

export default function PensamentoDiarioPage() {
  const [hoje, ...anteriores] = getPensamentos();

  return (
    <div>
      <p className="text-sm text-ink-3">Bem-vinda de volta,</p>
      <h1 className="mt-1 text-2xl text-ink">Pensamento diário</h1>
      <p className="mt-1 text-sm text-ink-2">
        Um áudio curto que a Camila envia para a comunidade a cada dia.
      </p>

      {/* Pensamento de hoje */}
      <article className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-tan">
          {hoje.data}
        </span>
        <h2 className="mt-2 text-xl text-ink">{hoje.titulo}</h2>
        <div className="mt-4">
          <AudioPlayerDemo duracao={hoje.duracao} />
        </div>
        <p className="mt-4 text-ink-2">{hoje.texto}</p>
      </article>

      {/* Anteriores */}
      <h3 className="mb-3 mt-10 text-sm font-semibold uppercase tracking-widest text-ink-3">
        Anteriores
      </h3>
      <div className="space-y-4">
        {anteriores.map((p) => (
          <article key={p.data} className="rounded-xl border border-line bg-surface p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-xs text-ink-3">{p.data}</span>
                <h4 className="text-base font-semibold text-ink">{p.titulo}</h4>
              </div>
            </div>
            <div className="mt-3">
              <AudioPlayerDemo duracao={p.duracao} />
            </div>
            <p className="mt-3 text-sm text-ink-2">{p.texto}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

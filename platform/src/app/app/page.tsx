import { createClient } from "@/lib/supabase/server";

function fmtData(d: string | null) {
  if (!d) return "";
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

export default async function PensamentoDiarioPage() {
  const supabase = await createClient();
  const { data: pensamentos } = await supabase
    .from("daily_thoughts")
    .select("*")
    .order("data", { ascending: false });

  const lista = pensamentos ?? [];

  // URLs assinadas dos áudios (bucket privado)
  const audioUrls = new Map<string, string>();
  for (const p of lista) {
    if (p.audio_path) {
      const { data } = await supabase.storage
        .from("audios")
        .createSignedUrl(p.audio_path, 3600);
      if (data?.signedUrl) audioUrls.set(p.id, data.signedUrl);
    }
  }

  const [hoje, ...anteriores] = lista;

  return (
    <div>
      <p className="text-sm text-ink-3">Bem-vinda de volta,</p>
      <h1 className="mt-1 text-2xl text-ink">Pensamento diário</h1>
      <p className="mt-1 text-sm text-ink-2">
        Um áudio curto que a Camila envia para a comunidade a cada dia.
      </p>

      {lista.length === 0 && (
        <div className="mt-6 rounded-2xl border border-line bg-surface p-6 text-ink-2">
          Ainda não há pensamentos publicados. Volte em breve. 🌱
        </div>
      )}

      {hoje && (
        <article className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-tan">
            Hoje · {fmtData(hoje.data)}
          </span>
          <h2 className="mt-2 text-xl text-ink">{hoje.titulo}</h2>
          {audioUrls.has(hoje.id) && (
            <audio controls preload="none" className="mt-4 w-full" src={audioUrls.get(hoje.id)} />
          )}
          {hoje.texto && <p className="mt-4 text-ink-2">{hoje.texto}</p>}
        </article>
      )}

      {anteriores.length > 0 && (
        <>
          <h3 className="mb-3 mt-10 text-sm font-semibold uppercase tracking-widest text-ink-3">
            Anteriores
          </h3>
          <div className="space-y-4">
            {anteriores.map((p) => (
              <article key={p.id} className="rounded-xl border border-line bg-surface p-5">
                <span className="text-xs text-ink-3">{fmtData(p.data)}</span>
                <h4 className="text-base font-semibold text-ink">{p.titulo}</h4>
                {audioUrls.has(p.id) && (
                  <audio controls preload="none" className="mt-3 w-full" src={audioUrls.get(p.id)} />
                )}
                {p.texto && <p className="mt-3 text-sm text-ink-2">{p.texto}</p>}
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

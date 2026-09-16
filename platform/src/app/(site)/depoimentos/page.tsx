import type { Metadata } from "next";
import Eyebrow from "@/components/Eyebrow";
import TestimonialCard, { type DepoimentoView } from "@/components/TestimonialCard";
import { createClient } from "@/lib/supabase/server";
import { youtubeId } from "@/lib/youtube";

export const metadata: Metadata = {
  title: "Depoimentos",
  description:
    "Histórias de quem passou pelo Instituto Brusch — O Círculo, a Cartografia e a terapia sistêmica.",
};

function iniciaisDe(nome: string) {
  return nome.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default async function DepoimentosPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonials")
    .select("id, nome, iniciais, contexto, tipo, texto, media_path, video_url")
    .eq("status", "aprovado")
    .order("ordem", { ascending: true });

  const depoimentos: DepoimentoView[] = (data ?? []).map((d) => {
    const nome = d.nome ?? "";
    const mediaUrl = d.media_path
      ? supabase.storage.from("capas").getPublicUrl(d.media_path).data.publicUrl
      : null;
    return {
      tipo: d.tipo ?? "texto",
      nome,
      iniciais: d.iniciais || iniciaisDe(nome),
      contexto: d.contexto ?? "",
      texto: d.texto,
      mediaUrl,
      youtubeId: youtubeId(d.video_url),
    };
  });

  return (
    <div className="mx-auto max-w-[1160px] px-6 py-16">
      <Eyebrow>Histórias</Eyebrow>
      <h1 className="mt-2 text-4xl text-ink">Depoimentos</h1>
      <div className="mt-10 [column-gap:1.25rem] sm:columns-2 lg:columns-3">
        {depoimentos.map((d, i) => (
          <TestimonialCard key={i} depoimento={d} />
        ))}
        {depoimentos.length === 0 && <p className="text-ink-2">Em breve.</p>}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Cursos",
  description:
    "Cursos do Instituto Brusch sobre autoconhecimento, paradigma sistêmico e arquétipos — assistidos dentro da plataforma.",
};

const fmtBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function CursosPage() {
  const supabase = await createClient();
  const { data: cursos } = await supabase
    .from("courses")
    .select("id, titulo, descricao, preco, capa_path")
    .eq("ativo", true)
    .order("titulo");

  return (
    <div className="mx-auto max-w-[1160px] px-6 py-16">
      <Eyebrow>Aprendizado</Eyebrow>
      <h1 className="mt-2 text-4xl text-ink">Cursos</h1>
      <p className="mt-3 max-w-[60ch] text-lg text-ink-2">
        Percursos em vídeo para aprofundar temas do autoconhecimento. As aulas ficam
        disponíveis na plataforma, no seu espaço de membro.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(cursos ?? []).map((c) => {
          const capaUrl = c.capa_path
            ? supabase.storage.from("capas").getPublicUrl(c.capa_path).data.publicUrl
            : null;
          return (
            <div key={c.id} className="flex flex-col overflow-hidden rounded-[10px] border border-line bg-surface shadow-sm">
              <div className="relative flex aspect-[16/10] items-end bg-gradient-to-br from-navy to-navy-d p-5">
                {capaUrl ? (
                  <img src={capaUrl} alt={c.titulo} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <span className="relative font-semibold text-white">{c.titulo}</span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-semibold text-ink">{c.titulo}</h2>
                <p className="mt-1 flex-1 text-sm text-ink-2">{c.descricao}</p>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                  <span className="font-semibold text-navy">{fmtBRL.format(Number(c.preco ?? 0))}</span>
                  <Button href="/contato">Comprar</Button>
                </div>
              </div>
            </div>
          );
        })}
        {(cursos ?? []).length === 0 && <p className="text-ink-2">Em breve.</p>}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";
import { getCursos } from "@/content";

export const metadata: Metadata = {
  title: "Cursos",
  description:
    "Cursos do Instituto Brusch sobre autoconhecimento, paradigma sistêmico e arquétipos — assistidos dentro da plataforma.",
};

export default function CursosPage() {
  const cursos = getCursos();
  return (
    <div className="mx-auto max-w-[1160px] px-6 py-16">
      <Eyebrow>Aprendizado</Eyebrow>
      <h1 className="mt-2 text-4xl text-ink">Cursos</h1>
      <p className="mt-3 max-w-[60ch] text-lg text-ink-2">
        Percursos em vídeo para aprofundar temas do autoconhecimento. As aulas ficam
        disponíveis na plataforma, no seu espaço de membro.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cursos.map((c) => (
          <div key={c.slug} className="flex flex-col overflow-hidden rounded-[10px] border border-line bg-surface shadow-sm">
            <div className="flex aspect-[16/10] items-end bg-gradient-to-br from-navy to-navy-d p-5">
              <span className="font-semibold text-white">{c.titulo}</span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <p className="flex-1 text-sm text-ink-2">{c.descricao}</p>
              <div className="mt-3 text-xs font-medium uppercase tracking-wide text-ink-3">
                {c.aulas} aulas
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                <span className="font-semibold text-navy">R$ {c.preco}</span>
                <Button href="/contato">Comprar</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

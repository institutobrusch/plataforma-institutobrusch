import type { Metadata } from "next";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";
import { getEbooks } from "@/content";

export const metadata: Metadata = {
  title: "E-books",
  description:
    "E-books do Instituto Brusch sobre autoconhecimento, sombra, arquétipos e desenvolvimento — leitura dentro da plataforma.",
};

export default function EbooksPage() {
  const ebooks = getEbooks();
  return (
    <div className="mx-auto max-w-[1160px] px-6 py-16">
      <Eyebrow>Biblioteca</Eyebrow>
      <h1 className="mt-2 text-4xl text-ink">E-books</h1>
      <p className="mt-3 max-w-[60ch] text-lg text-ink-2">
        Materiais para aprofundar o autoconhecimento. A leitura acontece dentro da
        plataforma, no seu espaço de membro.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ebooks.map((e) => (
          <div key={e.slug} className="flex flex-col overflow-hidden rounded-[10px] border border-line bg-surface shadow-sm">
            <div className="flex aspect-[3/4] items-end bg-gradient-to-br from-navy to-navy-d p-5">
              <span className="font-serif text-xl italic text-white">{e.titulo}</span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <p className="flex-1 text-sm text-ink-2">{e.descricao}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-semibold text-navy">R$ {e.preco}</span>
                <Button href="/contato">Comprar</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

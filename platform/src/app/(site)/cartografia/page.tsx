import type { Metadata } from "next";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";

export const metadata: Metadata = {
  title: "A sua Cartografia",
  description:
    "Cartografia do Instituto Brusch — acompanhamento contínuo a partir da sua carta: leituras, áudios e materiais das sessões. A carta não prevê o futuro; ela ilumina o presente.",
};

const FEATURES = [
  {
    titulo: "A carta",
    texto: "Sua cartografia visual com explicação detalhada dos campos e tópicos.",
  },
  {
    titulo: "Áudios & resumos",
    texto: "Cada sessão com áudio e resumo em texto para revisitar quando quiser.",
  },
  {
    titulo: "Materiais das sessões",
    texto: "Arquivos e apoios de cada sessão reunidos no seu espaço, quando houver.",
  },
];

export default function CartografiaPage() {
  return (
    <div>
      <div className="mx-auto grid max-w-[1160px] items-center gap-10 px-6 py-16 md:grid-cols-2">
        <div>
          <Eyebrow>Autoconhecimento</Eyebrow>
          <h1 className="mt-2 text-4xl text-ink md:text-5xl">A sua Cartografia</h1>
          <p className="mt-4 max-w-[54ch] text-lg text-ink-2">
            Um acompanhamento contínuo a partir da sua carta: leituras, áudios e
            resumos das sessões — um mapa vivo do seu momento. A carta não prevê o
            futuro; ela ilumina o presente.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/contato">Contratar minha cartografia</Button>
            <Button href="/entrar" variant="ghost">
              Acessar a plataforma
            </Button>
          </div>
        </div>
        <div className="relative aspect-square overflow-hidden rounded-[14px] bg-gradient-to-br from-navy to-navy-d p-8">
          <span className="text-sm font-semibold uppercase tracking-widest text-tan">
            Sua carta
          </span>
          <p className="mt-3 font-serif text-2xl italic text-white">
            &ldquo;O Mapa da Reconstrução&rdquo;
          </p>
          <p className="mt-4 max-w-[36ch] text-sm text-[color:#C7CDD8]">
            Um exemplo de carta e leitura — na plataforma, a sua carta aparece aqui,
            com explicação, tópicos e as sessões.
          </p>
        </div>
      </div>

      <div className="bg-surface-2">
        <div className="mx-auto grid max-w-[1160px] gap-6 px-6 py-16 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.titulo} className="rounded-[10px] border border-line bg-surface p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-navy">{f.titulo}</h2>
              <p className="mt-2 text-sm text-ink-2">{f.texto}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1160px] px-6 py-16 text-center">
        <h2 className="text-2xl text-ink">Como funciona o acesso</h2>
        <p className="mx-auto mt-2 max-w-[56ch] text-ink-2">
          Ao contratar a Cartografia, você recebe acesso à plataforma, onde
          acompanha sua carta, ouve os áudios das sessões e encontra os materiais —
          além da comunidade de membros.
        </p>
        <div className="mt-6 flex justify-center">
          <Button href="/contato">Quero começar</Button>
        </div>
      </div>
    </div>
  );
}

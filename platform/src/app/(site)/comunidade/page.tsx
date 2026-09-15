import type { Metadata } from "next";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";
import { getGrupos } from "@/content";

export const metadata: Metadata = {
  title: "Comunidade & Grupos",
  description:
    "A comunidade de membros do Instituto Brusch — um espaço para trocar experiências e se apoiar entre os encontros.",
};

export default function ComunidadePage() {
  const grupos = getGrupos();
  return (
    <div className="mx-auto max-w-[1160px] px-6 py-16">
      <Eyebrow>Membros</Eyebrow>
      <h1 className="mt-2 text-4xl text-ink">Comunidade &amp; Grupos</h1>
      <p className="mt-3 max-w-[60ch] text-lg text-ink-2">
        Um espaço para os membros trocarem experiências e se apoiarem entre os
        encontros. O acesso à comunidade acontece dentro da plataforma.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {grupos.map((g) => (
          <div key={g.titulo} className="rounded-[10px] border border-line bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">{g.titulo}</h2>
            <p className="mt-2 text-sm text-ink-2">{g.descricao}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-[14px] bg-surface-2 p-8 text-center">
        <h2 className="text-2xl text-ink">Faça parte da comunidade</h2>
        <p className="mx-auto mt-2 max-w-[52ch] text-ink-2">
          Ao entrar em um dos nossos produtos, você ganha acesso à comunidade de
          membros dentro da plataforma.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button href="/cartografia">Conhecer a Cartografia</Button>
          <Button href="/eventos" variant="ghost">
            Ver encontros
          </Button>
        </div>
      </div>
    </div>
  );
}

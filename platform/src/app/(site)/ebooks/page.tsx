import type { Metadata } from "next";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "E-books",
  description:
    "E-books do Instituto Brusch sobre autoconhecimento, sombra, arquétipos e desenvolvimento — leitura dentro da plataforma.",
};

const fmtBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function EbooksPage() {
  const supabase = await createClient();
  const { data: ebooks } = await supabase
    .from("ebooks")
    .select("id, titulo, descricao, preco, capa_path")
    .eq("ativo", true)
    .order("titulo");

  return (
    <div className="mx-auto max-w-[1160px] px-6 py-16">
      <Eyebrow>Biblioteca</Eyebrow>
      <h1 className="mt-2 text-4xl text-ink">E-books</h1>
      <p className="mt-3 max-w-[60ch] text-lg text-ink-2">
        Materiais para aprofundar o autoconhecimento. A leitura acontece dentro da
        plataforma, no seu espaço de membro.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(ebooks ?? []).map((e) => {
          const capaUrl = e.capa_path
            ? supabase.storage.from("capas").getPublicUrl(e.capa_path).data.publicUrl
            : null;
          return (
            <div key={e.id} className="flex flex-col overflow-hidden rounded-[10px] border border-line bg-surface shadow-sm">
              <div className="relative flex aspect-[3/4] items-end bg-gradient-to-br from-navy to-navy-d p-5">
                {capaUrl ? (
                  <img src={capaUrl} alt={e.titulo} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <span className="relative font-serif text-xl italic text-white">{e.titulo}</span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-semibold text-ink">{e.titulo}</h2>
                <p className="mt-1 flex-1 text-sm text-ink-2">{e.descricao}</p>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                  <span className="font-semibold text-navy">{fmtBRL.format(Number(e.preco ?? 0))}</span>
                  <Button href="/contato">Comprar</Button>
                </div>
              </div>
            </div>
          );
        })}
        {(ebooks ?? []).length === 0 && <p className="text-ink-2">Em breve.</p>}
      </div>
    </div>
  );
}

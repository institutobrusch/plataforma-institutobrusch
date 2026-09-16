import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Pill from "@/components/Pill";
import InscricaoButton from "@/components/InscricaoButton";
import { getEventoPublico } from "@/lib/eventos";

export async function generateMetadata({
  params,
}: PageProps<"/eventos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const evento = await getEventoPublico(slug);
  if (!evento) return { title: "Evento não encontrado" };
  return { title: evento.titulo, description: evento.descricao };
}

export default async function EventoDetalhe({
  params,
}: PageProps<"/eventos/[slug]">) {
  const { slug } = await params;
  const evento = await getEventoPublico(slug);
  if (!evento) notFound();

  const valor = evento.preco > 0 ? `R$ ${evento.preco}` : "Gratuito";

  return (
    <div className="mx-auto max-w-[1160px] px-6 py-16">
      <Link href="/eventos" className="text-sm font-semibold text-navy hover:underline">
        ← Voltar aos eventos
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="relative flex aspect-[16/9] items-start rounded-[10px] bg-gradient-to-br from-navy to-navy-d p-4">
            <Pill tipo={evento.tipo} />
          </div>
          <h1 className="mt-6 text-3xl text-ink">{evento.titulo}</h1>
          <p className="mt-4 max-w-[62ch] text-lg text-ink-2">{evento.descricao}</p>
        </div>

        <aside className="md:sticky md:top-24 md:self-start">
          <div className="rounded-[10px] border border-line bg-surface p-6 shadow-sm">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-3">Data</dt>
                <dd className="text-right font-medium text-ink">{evento.data}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-3">Local</dt>
                <dd className="text-right font-medium text-ink">{evento.local}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-3">Vagas</dt>
                <dd className="text-right font-medium text-ink">{evento.vagas}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-line pt-3">
                <dt className="text-ink-3">Valor</dt>
                <dd className="text-right text-lg font-semibold text-navy">{valor}</dd>
              </div>
            </dl>
            <div className="mt-5">
              <InscricaoButton titulo={evento.titulo} preco={evento.preco} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

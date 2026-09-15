import Link from "next/link";
import Pill from "./Pill";
import type { Evento } from "@/content";

export default function EventCard({ evento }: { evento: Evento }) {
  const preco = evento.preco > 0 ? `R$ ${evento.preco}` : "Gratuito";
  return (
    <Link
      href={`/eventos/${evento.slug}`}
      className="group flex flex-col overflow-hidden rounded-[10px] border border-line bg-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] bg-gradient-to-br from-navy to-navy-d">
        <div className="absolute left-3 top-3">
          <Pill tipo={evento.tipo} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-ink">{evento.titulo}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-2">
          <span>{evento.data}</span>
          <span aria-hidden>·</span>
          <span>{evento.local}</span>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <span className="font-semibold text-navy">{preco}</span>
          <span className="text-sm text-ink-3">{evento.vagas}</span>
        </div>
      </div>
    </Link>
  );
}

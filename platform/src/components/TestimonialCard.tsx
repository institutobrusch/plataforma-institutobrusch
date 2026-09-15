import type { Depoimento } from "@/content";

export default function TestimonialCard({ depoimento }: { depoimento: Depoimento }) {
  return (
    <figure className="mb-5 break-inside-avoid rounded-[10px] border border-line bg-surface p-6 shadow-sm">
      <span aria-hidden className="block text-3xl leading-none text-tan">
        &ldquo;
      </span>
      <blockquote className="mt-2 text-ink">{depoimento.texto}</blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-navy text-sm font-semibold text-surface">
          {depoimento.iniciais}
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-semibold text-ink">
            {depoimento.nome}
          </span>
          <span className="block text-xs text-ink-3">{depoimento.contexto}</span>
        </span>
      </figcaption>
    </figure>
  );
}

import type { Metadata } from "next";
import Eyebrow from "@/components/Eyebrow";
import TestimonialCard from "@/components/TestimonialCard";
import { getDepoimentos } from "@/content";

export const metadata: Metadata = {
  title: "Depoimentos",
  description:
    "Histórias de quem passou pelo Instituto Brusch — O Círculo, a Cartografia e a terapia sistêmica.",
};

export default function DepoimentosPage() {
  const depoimentos = getDepoimentos();
  return (
    <div className="mx-auto max-w-[1160px] px-6 py-16">
      <Eyebrow>Histórias</Eyebrow>
      <h1 className="mt-2 text-4xl text-ink">Depoimentos</h1>
      <div className="mt-10 [column-gap:1.25rem] sm:columns-2 lg:columns-3">
        {depoimentos.map((d) => (
          <TestimonialCard key={d.nome} depoimento={d} />
        ))}
      </div>
    </div>
  );
}

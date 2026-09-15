import type { Metadata } from "next";
import Eyebrow from "@/components/Eyebrow";
import { getFaq } from "@/content";

export const metadata: Metadata = {
  title: "Perguntas frequentes",
  description:
    "Dúvidas comuns sobre O Círculo, a Cartografia, eventos e o acesso à plataforma do Instituto Brusch.",
};

export default function FaqPage() {
  const faq = getFaq();
  return (
    <div className="mx-auto max-w-[760px] px-6 py-16">
      <Eyebrow>Ajuda</Eyebrow>
      <h1 className="mt-2 text-4xl text-ink">Perguntas frequentes</h1>

      <div className="mt-10 divide-y divide-line border-y border-line">
        {faq.map((item, i) => (
          <details key={i} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium text-ink">
              {item.pergunta}
              <span className="text-tan transition group-open:rotate-45" aria-hidden>
                +
              </span>
            </summary>
            <p className="mt-3 text-ink-2">{item.resposta}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

import Eyebrow from "@/components/Eyebrow";
import { getFaq as getFaqSeed } from "@/content";
import { getConteudo, getFaq } from "@/lib/site/content";

export async function generateMetadata() {
  const meta = await getConteudo("faq");
  return { title: meta.seoTitle, description: meta.seoDescription };
}

export default async function FaqPage() {
  const [itens] = await Promise.all([getFaq(), getConteudo("faq")]);
  const lista =
    itens.length === 0
      ? getFaqSeed().map((f, i) => ({ id: String(i), pergunta: f.pergunta, resposta: f.resposta }))
      : itens;

  return (
    <div className="mx-auto max-w-[760px] px-6 py-16">
      <Eyebrow>Ajuda</Eyebrow>
      <h1 className="mt-2 text-4xl text-ink">Perguntas frequentes</h1>

      <div className="mt-10 divide-y divide-line border-y border-line">
        {lista.map((item) => (
          <details key={item.id} className="group py-4">
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

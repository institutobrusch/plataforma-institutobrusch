import Eyebrow from "@/components/Eyebrow";
import FormSugestao from "@/components/FormSugestao";
import { getConteudo } from "@/lib/site/content";

export async function generateMetadata() {
  const c = await getConteudo("contato");
  return { title: c.seoTitle, description: c.seoDescription };
}

export default async function ContatoPage() {
  const c = await getConteudo("contato");
  return (
    <div className="mx-auto max-w-[1160px] px-6 py-16">
      <Eyebrow>{c.eyebrow}</Eyebrow>
      <h1 className="mt-2 text-4xl text-ink">{c.titulo}</h1>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-ink">Canais</h2>
          <ul className="mt-3 space-y-2 text-ink-2">
            {c.canais.map((canal, i) => (
              <li key={i}>
                {canal.href ? (
                  <>
                    {canal.label ? `${canal.label}: ` : ""}
                    <a
                      href={canal.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-navy hover:underline"
                    >
                      {canal.valor}
                    </a>
                  </>
                ) : (
                  <>
                    {canal.label ? `${canal.label}: ` : ""}
                    {canal.valor}
                  </>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-[46ch] text-sm text-ink-3">{c.textoAcesso}</p>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-ink">Enviar uma sugestão</h2>
          <FormSugestao />
        </div>
      </div>
    </div>
  );
}

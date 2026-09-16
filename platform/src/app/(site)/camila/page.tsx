import Image from "next/image";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";
import { getConteudo, imagemUrl } from "@/lib/site/content";

export async function generateMetadata() {
  const c = await getConteudo("camila");
  return { title: c.seoTitle, description: c.seoDescription };
}

export default async function CamilaPage() {
  const c = await getConteudo("camila");
  return (
    <div className="mx-auto grid max-w-[1160px] gap-12 px-6 py-16 md:grid-cols-[0.82fr_1.18fr]">
      <aside className="md:sticky md:top-24 md:self-start">
        <div className="relative mb-6 aspect-[4/5] overflow-hidden rounded-[10px] bg-tan-bg shadow-sm">
          <Image
            src={imagemUrl(c.fotoPath, "/fotos/camila-1.jpg")}
            alt="Camila Brusch"
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover object-top"
            priority
          />
        </div>
        <div className="rounded-[10px] border border-line bg-surface p-6">
          <Eyebrow>Formação &amp; atuação</Eyebrow>
          <ul className="mt-3 space-y-2 text-sm text-ink-2">
            {c.formacao.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </aside>

      <article className="max-w-[66ch]">
        <Eyebrow>{c.eyebrow}</Eyebrow>
        <h1 className="mt-2 text-4xl text-ink">{c.nome}</h1>
        <p className="mt-4 text-lg text-ink-2">{c.resumo}</p>

        {c.secoes.map((s) => (
          <div key={s.titulo}>
            <h2 className="mt-10 text-xl text-navy">{s.titulo}</h2>
            {s.paragrafos.map((p, i) => (
              <p key={i} className="mt-2 text-ink-2">
                {p}
              </p>
            ))}
          </div>
        ))}

        <div className="mt-10 flex flex-wrap gap-3">
          {c.ctas.map((cta) => (
            <Button
              key={cta.href}
              href={cta.href}
              variant={cta.variant === "ghost" ? "ghost" : "primary"}
            >
              {cta.label}
            </Button>
          ))}
        </div>
      </article>
    </div>
  );
}

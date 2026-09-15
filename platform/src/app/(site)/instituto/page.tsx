import type { Metadata } from "next";
import Image from "next/image";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";

export const metadata: Metadata = {
  title: "O Instituto",
  description:
    "O Instituto Brusch — centro integrado de saúde mental e autoconhecimento em Palmas (TO), onde a psicoterapia encontra a expansão de consciência.",
};

export default function InstitutoPage() {
  return (
    <div className="mx-auto grid max-w-[1160px] gap-12 px-6 py-16 md:grid-cols-[0.82fr_1.18fr]">
      <aside className="md:sticky md:top-24 md:self-start">
        <div className="relative mb-6 aspect-[4/5] overflow-hidden rounded-[10px] bg-tan-bg shadow-sm">
          <Image
            src="/fotos/camila-2.jpg"
            alt="Instituto Brusch"
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover object-top"
          />
        </div>
        <div className="rounded-[10px] border border-line bg-surface p-6">
          <Eyebrow>Nossas frentes</Eyebrow>
          <ul className="mt-3 space-y-2 text-sm text-ink-2">
            <li><b className="text-ink">O Círculo</b> — terapia em grupo aberta, em ciclos.</li>
            <li><b className="text-ink">Clínico &amp; sistêmico</b> — psicoterapia individual e familiar.</li>
            <li><b className="text-ink">Cartografia</b> — autoconhecimento com acompanhamento mensal.</li>
          </ul>
        </div>
      </aside>

      <article className="max-w-[66ch]">
        <Eyebrow>Sobre</Eyebrow>
        <h1 className="mt-2 text-4xl text-ink">O Instituto Brusch</h1>
        <p className="mt-4 text-lg text-ink-2">
          Um centro integrado de saúde mental e autoconhecimento em Palmas (TO),
          onde a psicoterapia encontra a expansão de consciência.
        </p>

        <h2 className="mt-10 text-xl text-navy">Pensamento sistêmico</h2>
        <p className="mt-2 text-ink-2">
          Olhamos para a pessoa dentro das suas relações — família, história e
          contexto. Muitos padrões que repetimos não nasceram em nós; reconhecê-los
          é o primeiro passo para reorganizá-los.
        </p>

        <h2 className="mt-8 text-xl text-navy">Expansão de consciência</h2>
        <p className="mt-2 text-ink-2">
          Autoconhecimento não é um destino, é um caminho. Unimos escuta clínica a
          práticas de presença para ampliar a forma como cada pessoa se percebe e
          se relaciona com a própria história.
        </p>

        <div className="mt-10">
          <Button href="/eventos">Ver encontros</Button>
        </div>
      </article>
    </div>
  );
}

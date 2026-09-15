import type { Metadata } from "next";
import Image from "next/image";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";

export const metadata: Metadata = {
  title: "Camila Brusch",
  description:
    "Camila Brusch — psicóloga clínica, terapeuta sistêmica e idealizadora do Instituto Brusch, em Palmas (TO).",
};

export default function CamilaPage() {
  return (
    <div className="mx-auto grid max-w-[1160px] gap-12 px-6 py-16 md:grid-cols-[0.82fr_1.18fr]">
      <aside className="md:sticky md:top-24 md:self-start">
        <div className="relative mb-6 aspect-[4/5] overflow-hidden rounded-[10px] bg-tan-bg shadow-sm">
          <Image
            src="/fotos/camila-1.jpg"
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
            <li>Psicóloga clínica (CRP)</li>
            <li>Terapeuta sistêmica</li>
            <li>Idealizadora de O Círculo e da Cartografia</li>
            <li>Atuação clínica e trabalhos em grupo</li>
          </ul>
        </div>
      </aside>

      <article className="max-w-[66ch]">
        <Eyebrow>A idealizadora</Eyebrow>
        <h1 className="mt-2 text-4xl text-ink">Camila Brusch</h1>
        <p className="mt-4 text-lg text-ink-2">
          Psicóloga clínica, terapeuta sistêmica e idealizadora do Instituto
          Brusch.
        </p>

        <h2 className="mt-10 text-xl text-navy">Uma escuta que acolhe</h2>
        <p className="mt-2 text-ink-2">
          O trabalho da Camila nasce da convicção de que o encontro cura. Na clínica
          e nos grupos, ela cria espaços seguros para que cada pessoa possa olhar
          para a própria história com honestidade e cuidado.
        </p>
        <p className="mt-3 text-ink-2">
          Da psicoterapia individual ao Círculo e à Cartografia, sua atuação une
          método clínico e um convite constante à presença e ao autoconhecimento.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button href="/cartografia">Conhecer a Cartografia</Button>
          <Button href="/contato" variant="ghost">
            Agendar uma conversa
          </Button>
        </div>
      </article>
    </div>
  );
}

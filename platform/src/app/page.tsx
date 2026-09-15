import Section from "@/components/Section";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";

export default function Home() {
  return (
    <Section className="py-20">
      <Eyebrow>Palmas · Tocantins</Eyebrow>
      <h1 className="mt-4 text-4xl text-navy md:text-6xl">
        Cuidar de vínculos é{" "}
        <span className="italic text-tan">transformar</span> histórias.
      </h1>
      <p className="mt-6 max-w-[60ch] text-lg text-ink-2">
        Fundação do projeto em Next.js com a identidade da marca. Esta página é
        provisória (verificação do design system) — a Início real vem na Task 5.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/eventos">Ver encontros</Button>
        <Button href="/cartografia" variant="ghost">
          Conhecer a Cartografia
        </Button>
      </div>
    </Section>
  );
}

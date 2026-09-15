export default function Home() {
  return (
    <main className="mx-auto max-w-[1160px] px-6 py-20">
      <p className="eyebrow">Palmas · Tocantins</p>
      <h1 className="mt-4 text-4xl md:text-6xl text-navy">
        Cuidar de vínculos é{" "}
        <span className="text-tan italic">transformar</span> histórias.
      </h1>
      <p className="mt-6 max-w-[60ch] text-ink-2 text-lg">
        Fundação do projeto em Next.js com a identidade da marca. Esta página é
        provisória (verificação do design system) — a Início real vem na Task 5.
      </p>
      <div className="mt-8 flex gap-3">
        <button className="rounded-full bg-navy px-6 py-3 font-semibold text-white transition hover:bg-navy-d">
          Botão primário
        </button>
        <button className="rounded-full border border-navy px-6 py-3 font-semibold text-navy transition hover:bg-tan-bg">
          Botão secundário
        </button>
      </div>
    </main>
  );
}

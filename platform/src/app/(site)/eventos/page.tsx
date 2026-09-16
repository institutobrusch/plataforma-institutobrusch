import type { Metadata } from "next";
import Eyebrow from "@/components/Eyebrow";
import EventosFilter from "@/components/EventosFilter";
import { getEventosPublicos } from "@/lib/eventos";

export const metadata: Metadata = {
  title: "Eventos & vivências",
  description:
    "Encontros presenciais em Palmas e experiências online do Instituto Brusch. Inscreva-se pela plataforma.",
};

export default async function EventosPage() {
  const eventos = await getEventosPublicos();
  return (
    <div className="mx-auto max-w-[1160px] px-6 py-16">
      <Eyebrow>Agenda</Eyebrow>
      <h1 className="mt-2 text-4xl text-ink">Eventos &amp; vivências</h1>
      <p className="mt-3 max-w-[60ch] text-lg text-ink-2">
        Encontros presenciais em Palmas e experiências online. Inscreva-se pela
        plataforma.
      </p>
      <div className="mt-10">
        <EventosFilter eventos={eventos} />
      </div>
    </div>
  );
}

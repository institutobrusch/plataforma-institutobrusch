import type { EventoTipo } from "@/content";

export default function Pill({ tipo }: { tipo: EventoTipo }) {
  const cls =
    tipo === "Presencial"
      ? "bg-tan-bg text-navy"
      : "bg-tan-bg text-gold";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${cls}`}
    >
      {tipo}
    </span>
  );
}

"use client";
import { useState } from "react";
import EventCard from "./EventCard";
import { filterEventos, type Filtro } from "@/lib/filterEventos";
import type { Evento } from "@/content";

const OPCOES: Filtro[] = ["Todos", "Presencial", "Online"];

export default function EventosFilter({ eventos }: { eventos: Evento[] }) {
  const [filtro, setFiltro] = useState<Filtro>("Todos");
  const lista = filterEventos(eventos, filtro);

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        {OPCOES.map((op) => {
          const ativo = op === filtro;
          return (
            <button
              key={op}
              type="button"
              onClick={() => setFiltro(op)}
              aria-pressed={ativo}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                ativo
                  ? "border-navy bg-navy text-surface"
                  : "border-line bg-surface text-ink-2 hover:border-navy hover:text-navy"
              }`}
            >
              {op}
            </button>
          );
        })}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {lista.map((e) => (
          <EventCard key={e.slug} evento={e} />
        ))}
      </div>
    </div>
  );
}

import type { Evento } from "@/content";

export type Filtro = "Todos" | "Presencial" | "Online";

export function filterEventos(eventos: Evento[], filtro: Filtro): Evento[] {
  if (filtro === "Todos") return eventos;
  return eventos.filter((e) => e.tipo === filtro);
}

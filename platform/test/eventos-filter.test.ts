import { describe, it, expect } from "vitest";
import { filterEventos } from "@/lib/filterEventos";
import { getEventos } from "@/content";

const evs = getEventos();

describe("filterEventos", () => {
  it("'Todos' retorna todos os eventos", () => {
    expect(filterEventos(evs, "Todos").length).toBe(evs.length);
  });
  it("'Presencial' retorna só presenciais", () => {
    expect(filterEventos(evs, "Presencial").every((e) => e.tipo === "Presencial")).toBe(true);
  });
  it("'Online' retorna só online", () => {
    const r = filterEventos(evs, "Online");
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((e) => e.tipo === "Online")).toBe(true);
  });
});

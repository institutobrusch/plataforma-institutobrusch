import { describe, it, expect } from "vitest";
import {
  getEventos,
  getEvento,
  getPosts,
  getPost,
  getDepoimentos,
  getGrupos,
  getFaq,
} from "@/content";

describe("camada de conteúdo", () => {
  it("retorna eventos com campos essenciais", () => {
    const evs = getEventos();
    expect(evs.length).toBeGreaterThanOrEqual(6);
    for (const e of evs) {
      expect(e.slug).toBeTruthy();
      expect(["Presencial", "Online"]).toContain(e.tipo);
      expect(typeof e.preco).toBe("number");
      expect(e.descricao.length).toBeGreaterThan(10);
    }
  });

  it("busca evento por slug e retorna undefined p/ inexistente", () => {
    expect(getEvento("circulo-out")?.titulo).toContain("Círculo");
    expect(getEvento("nao-existe")).toBeUndefined();
  });

  it("tem posts com corpo e busca por slug", () => {
    expect(getPosts().length).toBeGreaterThanOrEqual(3);
    const p = getPost("cartografia-mapa");
    expect(p?.autor).toBe("Camila Brusch");
    expect(p?.corpo.length).toBeGreaterThan(0);
    expect(getPost("xyz")).toBeUndefined();
  });

  it("tem depoimentos, grupos e faq do seed", () => {
    expect(getDepoimentos().length).toBeGreaterThanOrEqual(6);
    expect(getGrupos().length).toBeGreaterThanOrEqual(3);
    expect(getFaq().length).toBeGreaterThanOrEqual(4);
  });
});

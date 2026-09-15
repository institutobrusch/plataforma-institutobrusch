import { describe, it, expect } from "vitest";
import { montarFilaModeracao } from "./moderacao";

describe("montarFilaModeracao", () => {
  it("conta pendentes por aba", () => {
    const fila = montarFilaModeracao({
      posts: [{ id: "1", status: "pendente" }, { id: "2", status: "aprovado" }],
      depoimentos: [{ id: "d1", status: "pendente" }],
      sugestoes: [{ id: "s1", status: "pendente" }, { id: "s2", status: "pendente" }],
    });
    expect(fila.posts).toBe(1);
    expect(fila.depoimentos).toBe(1);
    expect(fila.sugestoes).toBe(2);
    expect(fila.total).toBe(4);
  });
  it("zera com listas vazias", () => {
    const fila = montarFilaModeracao({ posts: [], depoimentos: [], sugestoes: [] });
    expect(fila.total).toBe(0);
  });
});

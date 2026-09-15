import { describe, it, expect } from "vitest";
import { pensamentoVisivel } from "./pensamento";

const hoje = "2026-09-15";

describe("pensamentoVisivel", () => {
  it("publicado com data de hoje é visível", () => {
    expect(pensamentoVisivel({ status: "publicado", data: "2026-09-15" }, hoje)).toBe(true);
  });
  it("publicado com data passada é visível", () => {
    expect(pensamentoVisivel({ status: "publicado", data: "2026-09-01" }, hoje)).toBe(true);
  });
  it("publicado agendado para o futuro NÃO é visível", () => {
    expect(pensamentoVisivel({ status: "publicado", data: "2026-09-20" }, hoje)).toBe(false);
  });
  it("rascunho nunca é visível", () => {
    expect(pensamentoVisivel({ status: "rascunho", data: "2026-09-01" }, hoje)).toBe(false);
  });
});

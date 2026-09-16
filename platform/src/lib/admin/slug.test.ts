import { describe, it, expect } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("remove acentos e baixa a caixa", () => {
    expect(slugify("Círculo de Outubro")).toBe("circulo-de-outubro");
  });
  it("troca caracteres especiais por hífen e colapsa", () => {
    expect(slugify("E-book: Ansiedade & Você!!")).toBe("e-book-ansiedade-voce");
  });
  it("apara hífens das pontas", () => {
    expect(slugify("  Olá  ")).toBe("ola");
  });
  it("string sem letras vira vazia", () => {
    expect(slugify("---")).toBe("");
  });
});

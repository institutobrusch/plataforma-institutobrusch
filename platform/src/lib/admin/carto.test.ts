import { describe, it, expect } from "vitest";
import { parseTopicos, montarNomeArquivo } from "./carto";

describe("parseTopicos", () => {
  it("quebra por linha e remove vazias/espaços", () => {
    expect(parseTopicos("  A \n\n B \n  \nC ")).toEqual(["A", "B", "C"]);
  });
  it("string vazia vira lista vazia", () => {
    expect(parseTopicos("   ")).toEqual([]);
  });
});

describe("montarNomeArquivo", () => {
  it("preserva a extensão em minúsculas", () => {
    expect(montarNomeArquivo("Aula Final.MP3").endsWith(".mp3")).toBe(true);
  });
  it("gera nomes únicos", () => {
    expect(montarNomeArquivo("a.pdf")).not.toBe(montarNomeArquivo("a.pdf"));
  });
  it("aplica prefixo quando informado", () => {
    expect(montarNomeArquivo("a.pdf", "u123").startsWith("u123/")).toBe(true);
  });
  it("usa 'bin' quando não há extensão", () => {
    expect(montarNomeArquivo("semext").endsWith(".bin")).toBe(true);
  });
});

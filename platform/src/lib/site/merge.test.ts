import { describe, it, expect } from "vitest";
import { mergeConteudo } from "./merge";

const def = { a: "x", b: "y", lista: [{ t: "1" }], n: 3 };
describe("mergeConteudo", () => {
  it("retorna o default quando valor é vazio/nulo", () => {
    expect(mergeConteudo(def, null)).toEqual(def);
    expect(mergeConteudo(def, {})).toEqual(def);
  });
  it("sobrescreve apenas campos presentes", () => {
    expect(mergeConteudo(def, { a: "z" })).toEqual({ ...def, a: "z" });
  });
  it("substitui arrays inteiros (não faz merge item a item)", () => {
    expect(mergeConteudo(def, { lista: [{ t: "9" }, { t: "8" }] }).lista).toEqual([{ t: "9" }, { t: "8" }]);
  });
  it("ignora chaves ausentes no valor e mantém o default", () => {
    expect(mergeConteudo(def, { n: 5 })).toEqual({ ...def, n: 5 });
  });
});

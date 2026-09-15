import { describe, it, expect } from "vitest";
import { validarConvite, gerarToken } from "./convite";

const agora = new Date("2026-09-15T12:00:00Z");

describe("validarConvite", () => {
  it("aceita convite pendente não expirado", () => {
    expect(validarConvite({ status: "pendente", expira_em: "2026-09-20T00:00:00Z" }, agora)).toEqual({ ok: true });
  });
  it("recusa convite já usado", () => {
    expect(validarConvite({ status: "usado", expira_em: null }, agora)).toEqual({ ok: false, motivo: "usado" });
  });
  it("recusa convite expirado", () => {
    expect(validarConvite({ status: "pendente", expira_em: "2026-09-10T00:00:00Z" }, agora)).toEqual({ ok: false, motivo: "expirado" });
  });
});

describe("gerarToken", () => {
  it("gera token com pelo menos 20 caracteres", () => {
    expect(gerarToken().length).toBeGreaterThanOrEqual(20);
  });
  it("gera tokens diferentes", () => {
    expect(gerarToken()).not.toBe(gerarToken());
  });
});

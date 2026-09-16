import { describe, it, expect } from "vitest";
import { isAdminRole, podeAcessarAdmin, podeEditarBlog } from "./roles";

describe("roles", () => {
  it("admin é admin", () => {
    expect(isAdminRole("admin")).toBe(true);
  });
  it("member não é admin", () => {
    expect(isAdminRole("member")).toBe(false);
  });
  it("papel nulo não acessa admin", () => {
    expect(podeAcessarAdmin(null)).toBe(false);
  });
  it("admin acessa admin", () => {
    expect(podeAcessarAdmin("admin")).toBe(true);
  });
});

describe("podeEditarBlog", () => {
  it("admin e colunista podem", () => {
    expect(podeEditarBlog("admin")).toBe(true);
    expect(podeEditarBlog("colunista")).toBe(true);
  });
  it("demais não podem", () => {
    for (const p of ["member", "moderador", null, undefined, ""]) expect(podeEditarBlog(p as string)).toBe(false);
  });
});
describe("podeAcessarAdmin com colunista", () => {
  it("admin e colunista acessam o shell", () => {
    expect(podeAcessarAdmin("admin")).toBe(true);
    expect(podeAcessarAdmin("colunista")).toBe(true);
  });
  it("member não acessa", () => { expect(podeAcessarAdmin("member")).toBe(false); });
});

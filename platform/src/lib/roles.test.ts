import { describe, it, expect } from "vitest";
import { isAdminRole, podeAcessarAdmin } from "./roles";

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

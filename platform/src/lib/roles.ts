export type Papel = "member" | "admin" | "moderador" | "colunista";

export function isAdminRole(papel: string | null | undefined): boolean {
  return papel === "admin";
}

export function podeEditarBlog(papel: string | null | undefined): boolean {
  return papel === "admin" || papel === "colunista";
}

export function podeAcessarAdmin(papel: string | null | undefined): boolean {
  return isAdminRole(papel) || papel === "colunista";
}

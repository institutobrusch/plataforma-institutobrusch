export type Papel = "member" | "admin" | "moderador" | "colunista";

export function isAdminRole(papel: string | null | undefined): boolean {
  return papel === "admin";
}

// Onda 1: só admin entra no /admin. Papéis parciais entram na Onda 5.
export function podeAcessarAdmin(papel: string | null | undefined): boolean {
  return isAdminRole(papel);
}

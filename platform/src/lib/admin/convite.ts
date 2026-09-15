export type ResultadoConvite = { ok: true } | { ok: false; motivo: "usado" | "expirado" };

export function validarConvite(
  c: { status: string; expira_em: string | null },
  agora: Date,
): ResultadoConvite {
  if (c.status !== "pendente") return { ok: false, motivo: "usado" };
  if (c.expira_em && new Date(c.expira_em) < agora) return { ok: false, motivo: "expirado" };
  return { ok: true };
}

export function gerarToken(): string {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").slice(0, 8);
}

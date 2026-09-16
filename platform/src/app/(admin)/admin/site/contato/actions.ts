"use server";
import { requireAdmin } from "@/lib/auth";
import { salvarConteudo } from "@/lib/site/save";
export type SecaoState = { ok?: boolean; erro?: string } | null;

export async function salvarContato(_prev: SecaoState, fd: FormData): Promise<SecaoState> {
  await requireAdmin();
  let canais: { label: string; valor: string; href?: string }[] = [];
  try {
    const raw = JSON.parse(String(fd.get("canais") ?? "[]"));
    if (Array.isArray(raw)) {
      canais = raw
        .map((c) => ({
          label: String(c?.label ?? "").trim(),
          valor: String(c?.valor ?? "").trim(),
          href: String(c?.href ?? "").trim() || undefined,
        }))
        .filter((c) => c.valor);
    }
  } catch { canais = []; }
  const valor = {
    eyebrow: String(fd.get("eyebrow") ?? "").trim(),
    titulo: String(fd.get("titulo") ?? "").trim(),
    canais,
    textoAcesso: String(fd.get("textoAcesso") ?? "").trim(),
    seoTitle: String(fd.get("seoTitle") ?? "").trim(),
    seoDescription: String(fd.get("seoDescription") ?? "").trim(),
  };
  return salvarConteudo("contato", valor);
}

"use server";
import { requireAdmin } from "@/lib/auth";
import { salvarConteudo } from "@/lib/site/save";
export type SecaoState = { ok?: boolean; erro?: string } | null;

export async function salvarHome(_prev: SecaoState, fd: FormData): Promise<SecaoState> {
  await requireAdmin();
  let blocos: { titulo: string; texto: string }[] = [];
  try {
    const raw = JSON.parse(String(fd.get("blocos") ?? "[]"));
    if (Array.isArray(raw)) blocos = raw.map((b) => ({ titulo: String(b?.titulo ?? "").trim(), texto: String(b?.texto ?? "").trim() })).filter((b) => b.titulo || b.texto);
  } catch { blocos = []; }
  const valor = {
    eyebrow: String(fd.get("eyebrow") ?? "").trim(),
    heroTitulo: String(fd.get("heroTitulo") ?? "").trim(),
    heroTituloEnfase: String(fd.get("heroTituloEnfase") ?? "").trim(),
    heroTituloFim: String(fd.get("heroTituloFim") ?? "").trim(),
    heroSubtitulo: String(fd.get("heroSubtitulo") ?? "").trim(),
    ctaPrimarioLabel: String(fd.get("ctaPrimarioLabel") ?? "").trim(),
    ctaPrimarioHref: String(fd.get("ctaPrimarioHref") ?? "").trim(),
    ctaSecundarioLabel: String(fd.get("ctaSecundarioLabel") ?? "").trim(),
    ctaSecundarioHref: String(fd.get("ctaSecundarioHref") ?? "").trim(),
    blocos,
    seoTitle: String(fd.get("seoTitle") ?? "").trim(),
    seoDescription: String(fd.get("seoDescription") ?? "").trim(),
  };
  return salvarConteudo("home", valor);
}

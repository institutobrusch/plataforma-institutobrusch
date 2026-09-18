"use server";
import { requireAdmin } from "@/lib/auth";
import { getConteudo } from "@/lib/site/content";
import { salvarConteudo, uploadSiteImagem } from "@/lib/site/save";
export type SecaoState = { ok?: boolean; erro?: string } | null;

export async function salvarHome(_prev: SecaoState, fd: FormData): Promise<SecaoState> {
  await requireAdmin();
  let blocos: { titulo: string; texto: string }[] = [];
  try {
    const raw = JSON.parse(String(fd.get("blocos") ?? "[]"));
    if (Array.isArray(raw)) blocos = raw.map((b) => ({ titulo: String(b?.titulo ?? "").trim(), texto: String(b?.texto ?? "").trim() })).filter((b) => b.titulo || b.texto);
  } catch { blocos = []; }

  const atual = await getConteudo("home");
  let sobreFotoPath = atual.sobreFotoPath;
  const f = fd.get("sobreFotoPath") as File | null;
  if (f && f.size > 0) { const r = await uploadSiteImagem(f); if (typeof r !== "string") return r; sobreFotoPath = r; }

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
    sobreFotoPath,
    sobreEyebrow: String(fd.get("sobreEyebrow") ?? "").trim(),
    sobreTitulo: String(fd.get("sobreTitulo") ?? "").trim(),
    sobreTexto: String(fd.get("sobreTexto") ?? "").trim(),
    sobreCta1Label: String(fd.get("sobreCta1Label") ?? "").trim(),
    sobreCta1Href: String(fd.get("sobreCta1Href") ?? "").trim(),
    sobreCta2Label: String(fd.get("sobreCta2Label") ?? "").trim(),
    sobreCta2Href: String(fd.get("sobreCta2Href") ?? "").trim(),
    depoEyebrow: String(fd.get("depoEyebrow") ?? "").trim(),
    depoTitulo: String(fd.get("depoTitulo") ?? "").trim(),
    ctaFinalEyebrow: String(fd.get("ctaFinalEyebrow") ?? "").trim(),
    ctaFinalTitulo: String(fd.get("ctaFinalTitulo") ?? "").trim(),
    ctaFinalTexto: String(fd.get("ctaFinalTexto") ?? "").trim(),
    ctaFinalLabel: String(fd.get("ctaFinalLabel") ?? "").trim(),
    ctaFinalHref: String(fd.get("ctaFinalHref") ?? "").trim(),
    seoTitle: String(fd.get("seoTitle") ?? "").trim(),
    seoDescription: String(fd.get("seoDescription") ?? "").trim(),
  };
  return salvarConteudo("home", valor);
}

"use server";
import { requireAdmin } from "@/lib/auth";
import { getConteudo } from "@/lib/site/content";
import { salvarConteudo, uploadSiteImagem } from "@/lib/site/save";

export type SecaoState = { ok?: boolean; erro?: string } | null;

export async function salvarInstituto(_prev: SecaoState, fd: FormData): Promise<SecaoState> {
  await requireAdmin();

  const atual = await getConteudo("instituto");
  let fotoPath = atual.fotoPath;
  const f = fd.get("fotoPath") as File | null;
  if (f && f.size > 0) { const r = await uploadSiteImagem(f); if (typeof r !== "string") return r; fotoPath = r; }

  let frentes: { destaque: string; texto: string }[] = [];
  try {
    const raw = JSON.parse(String(fd.get("frentes") ?? "[]"));
    if (Array.isArray(raw)) frentes = raw
      .map((b) => ({ destaque: String(b?.destaque ?? "").trim(), texto: String(b?.texto ?? "").trim() }))
      .filter((b) => b.destaque || b.texto);
  } catch { frentes = []; }

  let secoes: { titulo: string; paragrafos: string[] }[] = [];
  try {
    const raw = JSON.parse(String(fd.get("secoes") ?? "[]"));
    if (Array.isArray(raw)) secoes = raw
      .map((s) => ({
        titulo: String(s?.titulo ?? "").trim(),
        paragrafos: Array.isArray(s?.paragrafos)
          ? s.paragrafos.map((p: unknown) => String(p ?? "").trim()).filter((p: string) => p.length > 0)
          : [],
      }))
      .filter((s) => s.titulo || s.paragrafos.length > 0);
  } catch { secoes = []; }

  const cta = {
    label: String(fd.get("ctaLabel") ?? "").trim(),
    href: String(fd.get("ctaHref") ?? "").trim(),
    variant: "solid" as const,
  };

  const valor = {
    fotoPath,
    eyebrow: String(fd.get("eyebrow") ?? "").trim(),
    titulo: String(fd.get("titulo") ?? "").trim(),
    subtitulo: String(fd.get("subtitulo") ?? "").trim(),
    frentesTitulo: String(fd.get("frentesTitulo") ?? "").trim(),
    frentes,
    secoes,
    cta,
    seoTitle: String(fd.get("seoTitle") ?? "").trim(),
    seoDescription: String(fd.get("seoDescription") ?? "").trim(),
  };

  return salvarConteudo("instituto", valor);
}

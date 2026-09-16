"use server";
import { requireAdmin } from "@/lib/auth";
import { getConteudo } from "@/lib/site/content";
import { salvarConteudo, uploadSiteImagem } from "@/lib/site/save";

export type SecaoState = { ok?: boolean; erro?: string } | null;

export async function salvarCamila(_prev: SecaoState, fd: FormData): Promise<SecaoState> {
  await requireAdmin();

  const atual = await getConteudo("camila");
  let fotoPath = atual.fotoPath;
  const f = fd.get("fotoPath") as File | null;
  if (f && f.size > 0) { const r = await uploadSiteImagem(f); if (typeof r !== "string") return r; fotoPath = r; }

  let formacao: string[] = [];
  try {
    const raw = JSON.parse(String(fd.get("formacao") ?? "[]"));
    if (Array.isArray(raw)) formacao = raw.map((x) => String(x ?? "").trim()).filter((x) => x.length > 0);
  } catch { formacao = []; }

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

  let ctas: { label: string; href: string; variant: "solid" | "ghost" }[] = [];
  try {
    const raw = JSON.parse(String(fd.get("ctas") ?? "[]"));
    if (Array.isArray(raw)) ctas = raw
      .map((c) => ({
        label: String(c?.label ?? "").trim(),
        href: String(c?.href ?? "").trim(),
        variant: String(c?.variant ?? "").trim() === "ghost" ? ("ghost" as const) : ("solid" as const),
      }))
      .filter((c) => c.label || c.href);
  } catch { ctas = []; }

  const valor = {
    fotoPath,
    eyebrow: String(fd.get("eyebrow") ?? "").trim(),
    nome: String(fd.get("nome") ?? "").trim(),
    resumo: String(fd.get("resumo") ?? "").trim(),
    formacao,
    secoes,
    ctas,
    seoTitle: String(fd.get("seoTitle") ?? "").trim(),
    seoDescription: String(fd.get("seoDescription") ?? "").trim(),
  };

  return salvarConteudo("camila", valor);
}

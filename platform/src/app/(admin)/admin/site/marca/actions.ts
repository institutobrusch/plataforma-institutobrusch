"use server";
import { requireAdmin } from "@/lib/auth";
import { getConteudo } from "@/lib/site/content";
import { salvarConteudo, uploadSiteImagem } from "@/lib/site/save";

export type SecaoState = { ok?: boolean; erro?: string } | null;

export async function salvarMarca(_prev: SecaoState, fd: FormData): Promise<SecaoState> {
  await requireAdmin();
  const atual = await getConteudo("marca");
  async function up(campo: "logoGoldPath" | "logoNavyPath" | "faviconPath"): Promise<string | { erro: string }> {
    const f = fd.get(campo) as File | null;
    if (f && f.size > 0) { const r = await uploadSiteImagem(f); return r; }
    return atual[campo];
  }
  const logoGoldPath = await up("logoGoldPath"); if (typeof logoGoldPath !== "string") return logoGoldPath;
  const logoNavyPath = await up("logoNavyPath"); if (typeof logoNavyPath !== "string") return logoNavyPath;
  const faviconPath = await up("faviconPath"); if (typeof faviconPath !== "string") return faviconPath;
  const valor = {
    logoGoldPath, logoNavyPath, faviconPath,
    rodapeTagline: String(fd.get("rodapeTagline") ?? "").trim(),
    instagramUrl: String(fd.get("instagramUrl") ?? "").trim(),
    instagramHandle: String(fd.get("instagramHandle") ?? "").trim(),
    cidadeUf: String(fd.get("cidadeUf") ?? "").trim(),
  };
  return salvarConteudo("marca", valor);
}

"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { registrarAcao } from "@/lib/admin/audit";
import { slugify } from "@/lib/admin/slug";
import { montarNomeArquivo } from "@/lib/admin/carto";

export type EbookState = { ok?: boolean; erro?: string } | null;

export async function salvarEbook(_prev: EbookState, formData: FormData): Promise<EbookState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim() || null;
  const preco = Number(formData.get("preco") ?? 0) || 0;
  const ativo = formData.get("ativo") === "on";
  let slug = String(formData.get("slug") ?? "").trim();
  if (!slug) slug = slugify(titulo);
  if (titulo.length < 2) return { erro: "Informe o título." };
  if (!slug) return { erro: "Slug inválido." };
  const capa = formData.get("capa") as File | null;
  const arquivo = formData.get("arquivo") as File | null;

  const supabase = await createClient();
  let capa_path: string | undefined;
  if (capa && capa.size > 0) {
    const nome = montarNomeArquivo(capa.name, "ebooks-capas");
    const { error } = await supabase.storage.from("capas").upload(nome, capa, { contentType: capa.type || "image/jpeg", upsert: false });
    if (error) return { erro: "Falha ao enviar a capa." };
    capa_path = nome;
  }
  let arquivo_path: string | undefined;
  if (arquivo && arquivo.size > 0) {
    const nome = montarNomeArquivo(arquivo.name, "ebooks");
    const { error } = await supabase.storage.from("ebooks").upload(nome, arquivo, { contentType: arquivo.type || "application/pdf", upsert: false });
    if (error) return { erro: "Falha ao enviar o arquivo." };
    arquivo_path = nome;
  }

  const base = { titulo, slug, descricao, preco, ativo };
  if (id) {
    const patch: typeof base & { capa_path?: string; arquivo_path?: string } = { ...base };
    if (capa_path) patch.capa_path = capa_path;
    if (arquivo_path) patch.arquivo_path = arquivo_path;
    const { error } = await supabase.from("ebooks").update(patch).eq("id", id);
    if (error) return { erro: error.code === "23505" ? "Já existe um e-book com esse slug." : "Não foi possível salvar." };
    await registrarAcao("update_ebook", { entidade: "ebooks", entidadeId: id });
  } else {
    const { data: row, error } = await supabase.from("ebooks").insert({ ...base, capa_path: capa_path ?? null, arquivo_path: arquivo_path ?? null }).select("id").single();
    if (error) return { erro: error.code === "23505" ? "Já existe um e-book com esse slug." : "Não foi possível criar." };
    await registrarAcao("create_ebook", { entidade: "ebooks", entidadeId: row.id });
  }
  revalidatePath("/admin/ebooks");
  revalidatePath("/ebooks");
  return { ok: true };
}

export async function alternarAtivoEbook(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const ativo = String(formData.get("ativo") ?? "") === "true";
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("ebooks").update({ ativo: !ativo }).eq("id", id);
  await registrarAcao("toggle_ebook", { entidade: "ebooks", entidadeId: id });
  revalidatePath("/admin/ebooks");
  revalidatePath("/ebooks");
}

export async function excluirEbook(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const { data: eb } = await supabase.from("ebooks").select("capa_path, arquivo_path").eq("id", id).maybeSingle();
  if (eb?.capa_path) await supabase.storage.from("capas").remove([eb.capa_path]);
  if (eb?.arquivo_path) await supabase.storage.from("ebooks").remove([eb.arquivo_path]);
  await supabase.from("ebooks").delete().eq("id", id);
  await registrarAcao("delete_ebook", { entidade: "ebooks", entidadeId: id });
  revalidatePath("/admin/ebooks");
  revalidatePath("/ebooks");
}

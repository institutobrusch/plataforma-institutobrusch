"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { registrarAcao } from "@/lib/admin/audit";
import { slugify } from "@/lib/admin/slug";
import { montarNomeArquivo } from "@/lib/admin/carto";

export type CursoState = { ok?: boolean; erro?: string } | null;

export async function salvarCurso(_prev: CursoState, formData: FormData): Promise<CursoState> {
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

  const supabase = await createClient();
  let capa_path: string | undefined;
  if (capa && capa.size > 0) {
    const nome = montarNomeArquivo(capa.name, "cursos");
    const { error } = await supabase.storage.from("capas").upload(nome, capa, { contentType: capa.type || "image/jpeg", upsert: false });
    if (error) return { erro: "Falha ao enviar a capa." };
    capa_path = nome;
  }

  const base = { titulo, slug, descricao, preco, ativo };
  if (id) {
    const patch: typeof base & { capa_path?: string } = { ...base };
    if (capa_path) patch.capa_path = capa_path;
    const { error } = await supabase.from("courses").update(patch).eq("id", id);
    if (error) return { erro: error.code === "23505" ? "Já existe um curso com esse slug." : "Não foi possível salvar." };
    await registrarAcao("update_course", { entidade: "courses", entidadeId: id });
  } else {
    const { data: row, error } = await supabase.from("courses").insert({ ...base, capa_path: capa_path ?? null }).select("id").single();
    if (error) return { erro: error.code === "23505" ? "Já existe um curso com esse slug." : "Não foi possível criar." };
    await registrarAcao("create_course", { entidade: "courses", entidadeId: row.id });
  }
  revalidatePath("/admin/cursos");
  revalidatePath("/cursos");
  return { ok: true };
}

export async function alternarAtivoCurso(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const ativo = String(formData.get("ativo") ?? "") === "true";
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("courses").update({ ativo: !ativo }).eq("id", id);
  await registrarAcao("toggle_course", { entidade: "courses", entidadeId: id });
  revalidatePath("/admin/cursos");
  revalidatePath("/cursos");
}

export async function excluirCurso(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const { data: c } = await supabase.from("courses").select("capa_path").eq("id", id).maybeSingle();
  await supabase.from("course_lessons").delete().eq("course_id", id);
  await supabase.from("course_modules").delete().eq("course_id", id);
  if (c?.capa_path) await supabase.storage.from("capas").remove([c.capa_path]);
  await supabase.from("courses").delete().eq("id", id);
  await registrarAcao("delete_course", { entidade: "courses", entidadeId: id });
  revalidatePath("/admin/cursos");
  revalidatePath("/cursos");
}

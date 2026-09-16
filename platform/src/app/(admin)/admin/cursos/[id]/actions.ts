"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { registrarAcao } from "@/lib/admin/audit";
import { youtubeId } from "@/lib/youtube";

export type ModuloState = { ok?: boolean; erro?: string } | null;
export type AulaState = { ok?: boolean; erro?: string } | null;

export async function salvarModulo(_prev: ModuloState, formData: FormData): Promise<ModuloState> {
  await requireAdmin();
  const courseId = String(formData.get("course_id") ?? "");
  const id = String(formData.get("id") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  const ordem = Number(formData.get("ordem") ?? 0) || 0;
  if (!courseId) return { erro: "Curso inválido." };
  if (titulo.length < 2) return { erro: "Informe o título do módulo." };

  const supabase = await createClient();
  if (id) {
    const { error } = await supabase.from("course_modules").update({ titulo, ordem }).eq("id", id);
    if (error) return { erro: "Não foi possível salvar o módulo." };
    await registrarAcao("update_module", { entidade: "course_modules", entidadeId: id });
  } else {
    const { error } = await supabase.from("course_modules").insert({ course_id: courseId, titulo, ordem });
    if (error) return { erro: "Não foi possível criar o módulo." };
    await registrarAcao("create_module", { entidade: "course_modules", entidadeId: courseId });
  }
  revalidatePath(`/admin/cursos/${courseId}`);
  return { ok: true };
}

export async function excluirModulo(formData: FormData) {
  await requireAdmin();
  const courseId = String(formData.get("course_id") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("course_lessons").delete().eq("module_id", id);
  await supabase.from("course_modules").delete().eq("id", id);
  await registrarAcao("delete_module", { entidade: "course_modules", entidadeId: id });
  revalidatePath(`/admin/cursos/${courseId}`);
}

export async function salvarAula(_prev: AulaState, formData: FormData): Promise<AulaState> {
  await requireAdmin();
  const courseId = String(formData.get("course_id") ?? "");
  const moduleId = String(formData.get("module_id") ?? "");
  const id = String(formData.get("id") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  const ordem = Number(formData.get("ordem") ?? 0) || 0;
  const urlBruta = String(formData.get("youtube_url") ?? "").trim();
  if (!courseId || !moduleId) return { erro: "Módulo inválido." };
  if (titulo.length < 2) return { erro: "Informe o título da aula." };
  const yid = urlBruta ? youtubeId(urlBruta) : null;
  if (urlBruta && !yid) return { erro: "URL do YouTube inválida." };

  const supabase = await createClient();
  if (id) {
    const { error } = await supabase.from("course_lessons").update({ titulo, ordem, youtube_id: yid }).eq("id", id);
    if (error) return { erro: "Não foi possível salvar a aula." };
    await registrarAcao("update_lesson", { entidade: "course_lessons", entidadeId: id });
  } else {
    const { error } = await supabase.from("course_lessons").insert({ course_id: courseId, module_id: moduleId, titulo, ordem, youtube_id: yid });
    if (error) return { erro: "Não foi possível criar a aula." };
    await registrarAcao("create_lesson", { entidade: "course_lessons", entidadeId: courseId });
  }
  revalidatePath(`/admin/cursos/${courseId}`);
  return { ok: true };
}

export async function excluirAula(formData: FormData) {
  await requireAdmin();
  const courseId = String(formData.get("course_id") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("course_lessons").delete().eq("id", id);
  await registrarAcao("delete_lesson", { entidade: "course_lessons", entidadeId: id });
  revalidatePath(`/admin/cursos/${courseId}`);
}

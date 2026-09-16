"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { registrarAcao } from "@/lib/admin/audit";
import { montarNomeArquivo } from "@/lib/admin/carto";

export type DepoimentoState = { ok?: boolean; erro?: string } | null;

export async function salvarDepoimento(_prev: DepoimentoState, formData: FormData): Promise<DepoimentoState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const nome = String(formData.get("nome") ?? "").trim() || null;
  const iniciais = String(formData.get("iniciais") ?? "").trim() || null;
  const contexto = String(formData.get("contexto") ?? "").trim() || null;
  const tipo = String(formData.get("tipo") ?? "texto").trim();
  const texto = String(formData.get("texto") ?? "").trim() || null;
  const video_url = String(formData.get("video_url") ?? "").trim() || null;
  const ordem = Number(formData.get("ordem") ?? 0) || 0;
  const status = String(formData.get("status") ?? "aprovado").trim();
  const midia = formData.get("midia") as File | null;
  if (!["texto", "imagem", "audio", "video"].includes(tipo)) return { erro: "Tipo inválido." };
  if (!nome) return { erro: "Informe o nome." };

  const supabase = await createClient();
  let media_path: string | undefined;
  if (midia && midia.size > 0) {
    const nomeArq = montarNomeArquivo(midia.name, "depoimentos");
    const { error: upErr } = await supabase.storage.from("capas").upload(nomeArq, midia, {
      contentType: midia.type || "application/octet-stream", upsert: false,
    });
    if (upErr) return { erro: "Falha ao enviar a mídia." };
    media_path = nomeArq;
  }

  const base = { nome, iniciais, contexto, tipo, texto, video_url, ordem, status };
  if (id) {
    const patch: typeof base & { media_path?: string } = { ...base };
    if (media_path) patch.media_path = media_path;
    const { error } = await supabase.from("testimonials").update(patch).eq("id", id);
    if (error) return { erro: "Não foi possível salvar." };
    await registrarAcao("update_testimonial", { entidade: "testimonials", entidadeId: id });
  } else {
    const { data: row, error } = await supabase.from("testimonials")
      .insert({ ...base, media_path: media_path ?? null }).select("id").single();
    if (error) return { erro: "Não foi possível criar." };
    await registrarAcao("create_testimonial", { entidade: "testimonials", entidadeId: row.id });
  }
  revalidatePath("/admin/depoimentos");
  revalidatePath("/depoimentos");
  revalidatePath("/");
  return { ok: true };
}

export async function excluirDepoimento(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const { data: d } = await supabase.from("testimonials").select("media_path").eq("id", id).maybeSingle();
  if (d?.media_path) await supabase.storage.from("capas").remove([d.media_path]);
  await supabase.from("testimonials").delete().eq("id", id);
  await registrarAcao("delete_testimonial", { entidade: "testimonials", entidadeId: id });
  revalidatePath("/admin/depoimentos");
  revalidatePath("/depoimentos");
  revalidatePath("/");
}

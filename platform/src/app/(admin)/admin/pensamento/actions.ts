"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { registrarAcao } from "@/lib/admin/audit";

export type PensamentoState = { ok?: boolean; erro?: string } | null;

export async function salvarPensamento(
  _prev: PensamentoState,
  formData: FormData,
): Promise<PensamentoState> {
  await requireAdmin();
  const titulo = String(formData.get("titulo") ?? "").trim();
  const texto = String(formData.get("texto") ?? "").trim() || null;
  const data = String(formData.get("data") ?? "").trim();
  const status = String(formData.get("status") ?? "publicado");
  const audio = formData.get("audio") as File | null;

  if (titulo.length < 2) return { erro: "Informe um título." };
  if (!data) return { erro: "Informe a data de publicação." };
  if (status !== "rascunho" && status !== "publicado") return { erro: "Status inválido." };

  const supabase = await createClient();

  let audio_path: string | null = null;
  if (audio && audio.size > 0) {
    const nome = `${data}-${crypto.randomUUID()}.${(audio.name.split(".").pop() ?? "mp3")}`;
    const { error: upErr } = await supabase.storage.from("audios").upload(nome, audio, {
      contentType: audio.type || "audio/mpeg",
      upsert: false,
    });
    if (upErr) return { erro: "Falha ao enviar o áudio." };
    audio_path = nome;
  }

  const insert: {
    titulo: string;
    texto: string | null;
    data: string;
    status: string;
    audio_path?: string;
  } = { titulo, texto, data, status };
  if (audio_path) insert.audio_path = audio_path;

  const { data: row, error } = await supabase
    .from("daily_thoughts")
    .insert(insert)
    .select("id")
    .single();
  if (error) return { erro: "Não foi possível salvar." };

  await registrarAcao("publish_thought", { entidade: "daily_thoughts", entidadeId: row.id, detalhe: { status, data } });
  revalidatePath("/admin/pensamento");
  revalidatePath("/app");
  return { ok: true };
}

export async function excluirPensamento(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("daily_thoughts").delete().eq("id", id);
  await registrarAcao("delete_thought", { entidade: "daily_thoughts", entidadeId: id });
  revalidatePath("/admin/pensamento");
  revalidatePath("/app");
}

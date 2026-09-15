"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { registrarAcao } from "@/lib/admin/audit";
import { parseTopicos, montarNomeArquivo } from "@/lib/admin/carto";

export type CartaState = { ok?: boolean; erro?: string } | null;

export async function salvarCarta(_prev: CartaState, formData: FormData): Promise<CartaState> {
  await requireAdmin();
  const userId = String(formData.get("user_id") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  const explicacao = String(formData.get("explicacao") ?? "").trim() || null;
  const topicos = parseTopicos(String(formData.get("topicos") ?? ""));
  const imagem = formData.get("imagem") as File | null;
  if (!userId) return { erro: "Cliente inválido." };
  if (titulo.length < 2) return { erro: "Informe um título para a carta." };

  const supabase = await createClient();
  const { data: existente } = await supabase
    .from("carto_cartas").select("id, imagem_path").eq("user_id", userId).limit(1).maybeSingle();

  let imagem_path = existente?.imagem_path ?? null;
  if (imagem && imagem.size > 0) {
    const nome = montarNomeArquivo(imagem.name, userId);
    const { error: upErr } = await supabase.storage.from("cartas").upload(nome, imagem, {
      contentType: imagem.type || "image/jpeg", upsert: false,
    });
    if (upErr) return { erro: "Falha ao enviar a imagem." };
    imagem_path = nome;
  }

  if (existente) {
    const { error } = await supabase.from("carto_cartas")
      .update({ titulo, explicacao, topicos, imagem_path }).eq("id", existente.id);
    if (error) return { erro: "Não foi possível salvar a carta." };
  } else {
    const { error } = await supabase.from("carto_cartas")
      .insert({ user_id: userId, titulo, explicacao, topicos, imagem_path });
    if (error) return { erro: "Não foi possível criar a carta." };
  }
  await registrarAcao("save_carta", { entidade: "carto_cartas", entidadeId: userId });
  revalidatePath(`/admin/cartografia/${userId}`);
  return { ok: true };
}

export type SessaoState = { ok?: boolean; erro?: string } | null;

export async function salvarSessao(_prev: SessaoState, formData: FormData): Promise<SessaoState> {
  await requireAdmin();
  const userId = String(formData.get("user_id") ?? "");
  const id = String(formData.get("id") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  const resumo = String(formData.get("resumo") ?? "").trim() || null;
  const data = String(formData.get("data") ?? "").trim() || null;
  const duracao = String(formData.get("duracao") ?? "").trim() || null;
  const ordem = Number(formData.get("ordem") ?? 0);
  const audio = formData.get("audio") as File | null;
  if (!userId) return { erro: "Cliente inválido." };
  if (titulo.length < 2) return { erro: "Informe um título." };

  const supabase = await createClient();
  let audio_path: string | null = null;
  if (audio && audio.size > 0) {
    const nome = montarNomeArquivo(audio.name, userId);
    const { error: upErr } = await supabase.storage.from("audios").upload(nome, audio, {
      contentType: audio.type || "audio/mpeg", upsert: false,
    });
    if (upErr) return { erro: "Falha ao enviar o áudio." };
    audio_path = nome;
  }

  if (id) {
    const patch: { titulo: string; resumo: string | null; data: string | null; duracao: string | null; ordem: number; audio_path?: string } =
      { titulo, resumo, data, duracao, ordem };
    if (audio_path) patch.audio_path = audio_path;
    const { error } = await supabase.from("carto_sessions").update(patch).eq("id", id);
    if (error) return { erro: "Não foi possível salvar a sessão." };
    await registrarAcao("update_sessao", { entidade: "carto_sessions", entidadeId: id });
  } else {
    const { error } = await supabase.from("carto_sessions")
      .insert({ user_id: userId, titulo, resumo, data, duracao, ordem, audio_path });
    if (error) return { erro: "Não foi possível criar a sessão." };
    await registrarAcao("create_sessao", { entidade: "carto_sessions", entidadeId: userId });
  }
  revalidatePath(`/admin/cartografia/${userId}`);
  return { ok: true };
}

export async function excluirSessao(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("user_id") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const { data: s } = await supabase.from("carto_sessions").select("audio_path").eq("id", id).maybeSingle();
  if (s?.audio_path) await supabase.storage.from("audios").remove([s.audio_path]);
  await supabase.from("carto_sessions").delete().eq("id", id);
  await registrarAcao("delete_sessao", { entidade: "carto_sessions", entidadeId: id });
  revalidatePath(`/admin/cartografia/${userId}`);
}

export type MaterialState = { ok?: boolean; erro?: string } | null;

export async function salvarMaterial(_prev: MaterialState, formData: FormData): Promise<MaterialState> {
  await requireAdmin();
  const userId = String(formData.get("user_id") ?? "");
  const id = String(formData.get("id") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "").trim() || null;
  const sessionId = String(formData.get("session_id") ?? "") || null;
  const url = String(formData.get("url") ?? "").trim() || null;
  const arquivo = formData.get("arquivo") as File | null;
  if (!userId) return { erro: "Cliente inválido." };
  if (titulo.length < 2) return { erro: "Informe um título." };

  const supabase = await createClient();
  let arquivo_path: string | null = null;
  if (arquivo && arquivo.size > 0) {
    const nome = montarNomeArquivo(arquivo.name, userId);
    const { error: upErr } = await supabase.storage.from("materiais").upload(nome, arquivo, {
      contentType: arquivo.type || "application/octet-stream", upsert: false,
    });
    if (upErr) return { erro: "Falha ao enviar o arquivo." };
    arquivo_path = nome;
  }

  if (id) {
    const patch: { titulo: string; tipo: string | null; session_id: string | null; url: string | null; arquivo_path?: string } =
      { titulo, tipo, session_id: sessionId, url };
    if (arquivo_path) patch.arquivo_path = arquivo_path;
    const { error } = await supabase.from("carto_materials").update(patch).eq("id", id);
    if (error) return { erro: "Não foi possível salvar o material." };
    await registrarAcao("update_material", { entidade: "carto_materials", entidadeId: id });
  } else {
    const { error } = await supabase.from("carto_materials")
      .insert({ user_id: userId, session_id: sessionId, titulo, tipo, url, arquivo_path });
    if (error) return { erro: "Não foi possível criar o material." };
    await registrarAcao("create_material", { entidade: "carto_materials", entidadeId: userId });
  }
  revalidatePath(`/admin/cartografia/${userId}`);
  return { ok: true };
}

export async function excluirMaterial(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("user_id") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const { data: m } = await supabase.from("carto_materials").select("arquivo_path").eq("id", id).maybeSingle();
  if (m?.arquivo_path) await supabase.storage.from("materiais").remove([m.arquivo_path]);
  await supabase.from("carto_materials").delete().eq("id", id);
  await registrarAcao("delete_material", { entidade: "carto_materials", entidadeId: id });
  revalidatePath(`/admin/cartografia/${userId}`);
}

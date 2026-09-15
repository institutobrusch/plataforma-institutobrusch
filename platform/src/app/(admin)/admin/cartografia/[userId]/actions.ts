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

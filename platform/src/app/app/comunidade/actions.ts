"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { registrarAcao } from "@/lib/admin/audit";

export type PostState = { ok?: boolean; erro?: string } | null;

export async function publicarPost(
  _prev: PostState,
  formData: FormData,
): Promise<PostState> {
  const texto = String(formData.get("texto") ?? "").trim();
  if (texto.length < 3) return { erro: "Escreva um pouco mais." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Sessão expirada." };

  const { error } = await supabase
    .from("community_posts")
    .insert({ author_id: user.id, texto, status: "pendente" });
  if (error) return { erro: "Não foi possível enviar." };

  revalidatePath("/app/comunidade");
  return { ok: true };
}

// --- Exclusão pelo admin (posts e comentários) ---
// A política RLS "admin modera" (is_admin()) permite o DELETE; e as FKs de
// comentários/curtidas têm ON DELETE CASCADE, então excluir um post já limpa os
// comentários e curtidas associados.
export async function excluirPost(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("community_posts").delete().eq("id", id);
  await registrarAcao("delete_post", { entidade: "community_posts", entidadeId: id });
  revalidatePath("/app/comunidade");
  revalidatePath("/admin/moderacao");
}

export async function excluirComentario(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("community_comments").delete().eq("id", id);
  await registrarAcao("delete_comment", { entidade: "community_comments", entidadeId: id });
  revalidatePath("/app/comunidade");
  revalidatePath("/admin/moderacao");
}

export type ComentarioState = { ok?: boolean; erro?: string } | null;

export async function comentar(
  _prev: ComentarioState,
  formData: FormData,
): Promise<ComentarioState> {
  const postId = String(formData.get("postId") ?? "");
  const texto = String(formData.get("texto") ?? "").trim();
  if (!postId) return { erro: "Publicação inválida." };
  if (texto.length < 2) return { erro: "Escreva um pouco mais." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Sessão expirada." };

  const { error } = await supabase
    .from("community_comments")
    .insert({ post_id: postId, author_id: user.id, texto, status: "pendente" });
  if (error) return { erro: "Não foi possível comentar." };

  revalidatePath("/app/comunidade");
  return { ok: true };
}

export type LikeState = { ok?: boolean; erro?: string } | null;

export async function curtir(_prev: LikeState, formData: FormData): Promise<LikeState> {
  const postId = String(formData.get("postId") ?? "");
  if (!postId) return { erro: "Publicação inválida." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Sessão expirada." };

  const { data: existente } = await supabase
    .from("community_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existente) {
    const { error } = await supabase
      .from("community_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);
    if (error) {
      console.error("[comunidade] descurtir falhou:", error.code, error.message);
      return { erro: "Não foi possível curtir." };
    }
  } else {
    const { error } = await supabase
      .from("community_likes")
      .insert({ post_id: postId, user_id: user.id });
    if (error) {
      console.error("[comunidade] curtir falhou:", error.code, error.message);
      return { erro: "Não foi possível curtir." };
    }
  }
  revalidatePath("/app/comunidade");
  return { ok: true };
}

"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

export async function curtir(formData: FormData) {
  const postId = String(formData.get("postId") ?? "");
  if (!postId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existente } = await supabase
    .from("community_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existente) {
    await supabase
      .from("community_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);
  } else {
    await supabase
      .from("community_likes")
      .insert({ post_id: postId, user_id: user.id });
  }
  revalidatePath("/app/comunidade");
}

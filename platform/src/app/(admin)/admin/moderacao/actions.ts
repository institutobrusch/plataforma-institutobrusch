"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { registrarAcao } from "@/lib/admin/audit";

async function setStatus(
  tabela: "community_posts" | "testimonials" | "suggestions",
  id: string,
  status: string,
  acao: string,
) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from(tabela).update({ status }).eq("id", id);
  await registrarAcao(acao, { entidade: tabela, entidadeId: id, detalhe: { status } });
  revalidatePath("/admin/moderacao");
}

export async function moderarPost(formData: FormData) {
  await setStatus("community_posts", String(formData.get("id")), String(formData.get("status")), "moderate_post");
  revalidatePath("/app/comunidade");
}
export async function moderarDepoimento(formData: FormData) {
  await setStatus("testimonials", String(formData.get("id")), String(formData.get("status")), "moderate_testimonial");
}
export async function moderarSugestao(formData: FormData) {
  await setStatus("suggestions", String(formData.get("id")), String(formData.get("status")), "moderate_suggestion");
}

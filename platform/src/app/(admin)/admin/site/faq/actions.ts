"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { registrarAcao } from "@/lib/admin/audit";
import { salvarConteudo } from "@/lib/site/save";

export type FaqState = { ok?: boolean; erro?: string } | null;

export async function salvarFaqItem(_prev: FaqState, fd: FormData): Promise<FaqState> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const pergunta = String(fd.get("pergunta") ?? "").trim();
  const resposta = String(fd.get("resposta") ?? "").trim();
  const ordem = Number(fd.get("ordem") ?? 0) || 0;
  const ativo = fd.get("ativo") === "on" || fd.get("ativo") === "true";
  if (!pergunta || !resposta) return { erro: "Preencha pergunta e resposta." };
  const supabase = await createClient();
  if (id) {
    const { error } = await supabase.from("faq_items").update({ pergunta, resposta, ordem, ativo }).eq("id", id);
    if (error) return { erro: "Não foi possível salvar." };
    await registrarAcao("update_faq", { entidade: "faq_items", entidadeId: id });
  } else {
    const { data: row, error } = await supabase.from("faq_items").insert({ pergunta, resposta, ordem, ativo }).select("id").single();
    if (error) return { erro: "Não foi possível criar." };
    await registrarAcao("create_faq", { entidade: "faq_items", entidadeId: row.id });
  }
  revalidatePath("/admin/site/faq");
  revalidatePath("/faq");
  return { ok: true };
}

export async function excluirFaqItem(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("faq_items").delete().eq("id", id);
  await registrarAcao("delete_faq", { entidade: "faq_items", entidadeId: id });
  revalidatePath("/admin/site/faq");
  revalidatePath("/faq");
}

export async function salvarFaqSeo(_prev: FaqState, fd: FormData): Promise<FaqState> {
  await requireAdmin();
  return salvarConteudo("faq", {
    seoTitle: String(fd.get("seoTitle") ?? "").trim(),
    seoDescription: String(fd.get("seoDescription") ?? "").trim(),
  });
}

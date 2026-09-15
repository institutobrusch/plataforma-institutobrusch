"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { registrarAcao } from "@/lib/admin/audit";

export type AcessoState = { ok?: boolean; erro?: string } | null;

export async function concederAcesso(
  _prev: AcessoState,
  formData: FormData,
): Promise<AcessoState> {
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const productId = String(formData.get("product_id") ?? "");
  const registrarVenda = formData.get("registrar_venda") === "on";
  const valor = Number(formData.get("valor") ?? 0);
  if (!email || !productId) return { erro: "Informe e-mail e produto." };

  const supabase = await createClient();

  // profiles não guarda e-mail; localizar user_id pelo e-mail exige service role.
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  const { data: list } = await admin.auth.admin.listUsers();
  const alvo = list?.users.find((u) => u.email?.toLowerCase() === email);
  if (!alvo) return { erro: "Nenhum usuário com esse e-mail." };

  const { error } = await supabase.from("user_products").insert({
    user_id: alvo.id,
    product_id: productId,
    origem: "admin",
    status: "ativo",
  });
  if (error) return { erro: "Não foi possível conceder (talvez já tenha o produto)." };

  if (registrarVenda) {
    await supabase.from("sales").insert({ user_id: alvo.id, product_id: productId, valor });
  }
  await registrarAcao("grant_product", { entidade: "user_products", entidadeId: alvo.id, detalhe: { productId, registrarVenda, valor } });
  revalidatePath("/admin/acessos");
  return { ok: true };
}

export async function removerAcesso(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("user_products").update({ status: "cancelado" }).eq("id", id);
  await registrarAcao("revoke_product", { entidade: "user_products", entidadeId: id });
  revalidatePath("/admin/acessos");
}

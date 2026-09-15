"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { registrarAcao } from "@/lib/admin/audit";
import { gerarToken } from "@/lib/admin/convite";

export type ConviteState = { ok?: boolean; erro?: string; token?: string } | null;

export async function criarConvite(
  _prev: ConviteState,
  formData: FormData,
): Promise<ConviteState> {
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const productId = String(formData.get("product_id") ?? "") || null;
  if (!email) return { erro: "Informe o e-mail." };

  const supabase = await createClient();
  const token = gerarToken();
  const expira = new Date();
  expira.setDate(expira.getDate() + 14);

  const { data, error } = await supabase.from("invites").insert({
    email, product_id: productId, token, status: "pendente", expira_em: expira.toISOString(),
  }).select("id").single();
  if (error) return { erro: "Não foi possível criar o convite." };

  await registrarAcao("create_invite", { entidade: "invites", entidadeId: data.id, detalhe: { email, productId } });
  revalidatePath("/admin/convites");
  return { ok: true, token };
}

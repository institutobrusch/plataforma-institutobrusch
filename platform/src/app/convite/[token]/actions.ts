"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validarConvite } from "@/lib/admin/convite";

export type ResgateState = { erro?: string } | null;

export async function resgatarConvite(
  _prev: ResgateState,
  formData: FormData,
): Promise<ResgateState> {
  const token = String(formData.get("token") ?? "");
  const senha = String(formData.get("senha") ?? "");
  if (senha.length < 8) return { erro: "A senha deve ter ao menos 8 caracteres." };

  const admin = createAdminClient();
  const { data: convite } = await admin
    .from("invites")
    .select("id, email, product_id, status, expira_em")
    .eq("token", token)
    .maybeSingle();
  if (!convite) return { erro: "Convite inválido." };

  const check = validarConvite(convite, new Date());
  if (!check.ok) return { erro: check.motivo === "usado" ? "Convite já utilizado." : "Convite expirado." };

  // cria (ou confirma) o usuário
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email: convite.email,
    password: senha,
    email_confirm: true,
  });
  if (cErr || !created.user) return { erro: "Não foi possível criar a conta." };

  if (convite.product_id) {
    await admin.from("user_products").insert({
      user_id: created.user.id,
      product_id: convite.product_id,
      origem: "convite",
      status: "ativo",
    });
  }
  await admin.from("invites").update({ status: "usado" }).eq("id", convite.id);

  // loga o cliente
  const supabase = await createClient();
  await supabase.auth.signInWithPassword({ email: convite.email, password: senha });
  redirect("/app");
}

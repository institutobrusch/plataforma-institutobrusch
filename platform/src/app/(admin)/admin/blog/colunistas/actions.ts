"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { registrarAcao } from "@/lib/admin/audit";

export type ColunistaState = { ok?: boolean; erro?: string } | null;

export async function promoverColunista(_prev: ColunistaState, fd: FormData): Promise<ColunistaState> {
  await requireAdmin();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (!email) return { erro: "Informe o e-mail." };
  const admin = createAdminClient();
  const { data: list } = await admin.auth.admin.listUsers();
  const u = list?.users.find((x) => (x.email ?? "").toLowerCase() === email);
  if (!u) return { erro: "Nenhum usuário com esse e-mail (a pessoa precisa ter conta)." };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ papel: "colunista" }).eq("id", u.id);
  if (error) return { erro: "Não foi possível promover." };
  await registrarAcao("promote_colunista", { entidade: "profiles", entidadeId: u.id, detalhe: { email } });
  revalidatePath("/admin/blog/colunistas");
  return { ok: true };
}

export async function rebaixarColunista(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("profiles").update({ papel: "member" }).eq("id", id).eq("papel", "colunista");
  await registrarAcao("demote_colunista", { entidade: "profiles", entidadeId: id });
  revalidatePath("/admin/blog/colunistas");
}

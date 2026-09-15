import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type ClienteCartografia = { id: string; nome: string; email: string };

export async function listarClientesCartografia(): Promise<ClienteCartografia[]> {
  const supabase = await createClient();
  const { data: ups } = await supabase
    .from("user_products")
    .select("user_id, products!inner(slug)")
    .eq("status", "ativo")
    .eq("products.slug", "cartografia");

  const ids = Array.from(new Set((ups ?? []).map((u) => u.user_id)));
  if (ids.length === 0) return [];

  const { data: profs } = await supabase.from("profiles").select("id, nome").in("id", ids);
  const nomeById = new Map((profs ?? []).map((p) => [p.id, p.nome ?? ""]));

  const admin = createAdminClient();
  // TODO paginar quando houver muitos usuários
  const { data: list } = await admin.auth.admin.listUsers();
  const emailById = new Map((list?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  return ids
    .map((id) => ({ id, nome: nomeById.get(id) ?? "", email: emailById.get(id) ?? "" }))
    .sort((a, b) => a.nome.localeCompare(b.nome));
}

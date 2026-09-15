import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return data;
}

// Slugs dos produtos ativos do usuário (para montar o menu lateral).
export async function getMeusProdutos(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_products")
    .select("status, products(slug)")
    .eq("status", "ativo");
  return (data ?? [])
    .map((r) => (r.products as { slug: string } | null)?.slug)
    .filter((s): s is string => Boolean(s));
}

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/entrar");
  return user;
}

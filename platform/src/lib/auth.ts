import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminRole, podeEditarBlog } from "@/lib/roles";

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

export async function getMinhaRole(): Promise<string | null> {
  const profile = await getProfile();
  return profile?.papel ?? null;
}

export async function requireAdmin() {
  const user = await getUser();
  if (!user) redirect("/entrar");
  const role = await getMinhaRole();
  if (!isAdminRole(role)) redirect("/app");
  return user;
}

export async function requireBlogAutor() {
  const user = await getUser();
  if (!user) redirect("/entrar");
  const role = await getMinhaRole();
  if (!podeEditarBlog(role)) redirect("/app");
  return { user, role };
}

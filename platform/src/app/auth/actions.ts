"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function entrarComEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("senha") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/entrar?erro=credenciais");
  redirect("/app");
}

export async function entrarComGoogle() {
  const supabase = await createClient();
  // Usa o domínio real da requisição para o retorno do OAuth; a env var fica
  // apenas como fallback. Evita redirecionar para localhost em produção.
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");
  const site = host
    ? `${proto}://${host}`
    : (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${site}/auth/callback` },
  });
  if (error || !data.url) redirect("/entrar?erro=google");
  redirect(data.url);
}

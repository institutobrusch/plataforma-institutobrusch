"use server";
import { createClient } from "@/lib/supabase/server";

export type SugestaoState = { ok?: boolean; erro?: string } | null;

export async function enviarSugestao(
  _prev: SugestaoState,
  formData: FormData,
): Promise<SugestaoState> {
  const texto = String(formData.get("texto") ?? "").trim();
  if (texto.length < 5) return { erro: "Escreva um pouco mais para enviarmos sua sugestão." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("suggestions")
    .insert({ texto, user_id: user?.id ?? null });
  if (error) return { erro: "Não foi possível enviar agora. Tente novamente." };

  return { ok: true };
}

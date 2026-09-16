import "server-only";
import { createClient } from "@/lib/supabase/server";
import { DEFAULTS } from "./defaults";
import { mergeConteudo } from "./merge";
import type { ChaveSecao, SecaoMap } from "./types";

export async function getConteudo<K extends ChaveSecao>(chave: K): Promise<SecaoMap[K]> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("valor").eq("chave", chave).maybeSingle();
  return mergeConteudo(DEFAULTS[chave], data?.valor ?? null);
}

export type FaqItem = { id: string; pergunta: string; resposta: string };
export async function getFaq(): Promise<FaqItem[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("faq_items").select("id,pergunta,resposta").eq("ativo", true).order("ordem", { ascending: true });
  return (data ?? []) as FaqItem[];
}

export function imagemUrl(path: string, fallback: string): string {
  if (!path) return fallback;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/capas/${path}`;
}

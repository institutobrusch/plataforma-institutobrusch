import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { registrarAcao } from "@/lib/admin/audit";
import { montarNomeArquivo } from "@/lib/admin/carto";
import type { Json } from "@/lib/database.types";
import type { ChaveSecao } from "./types";

const ROTAS: Record<ChaveSecao, string[]> = {
  marca: ["/", "/instituto", "/camila", "/faq", "/contato"],
  home: ["/"], instituto: ["/instituto"], camila: ["/camila"],
  contato: ["/contato"], faq: ["/faq"],
};

export async function salvarConteudo(chave: ChaveSecao, valor: Record<string, unknown>) {
  const supabase = await createClient();
  const { error } = await supabase.from("site_content")
    .upsert({ chave, valor: valor as Json, updated_at: new Date().toISOString() });
  if (error) return { erro: "Não foi possível salvar." };
  await registrarAcao("update_site_content", { entidade: "site_content", entidadeId: chave });
  for (const r of ROTAS[chave]) revalidatePath(r);
  revalidatePath("/admin/site");
  return { ok: true as const };
}

export async function uploadSiteImagem(file: File): Promise<string | { erro: string }> {
  const supabase = await createClient();
  const nome = montarNomeArquivo(file.name, "site");
  const { error } = await supabase.storage.from("capas").upload(nome, file, {
    contentType: file.type || "application/octet-stream", upsert: false,
  });
  if (error) return { erro: "Falha ao enviar a imagem." };
  return nome;
}

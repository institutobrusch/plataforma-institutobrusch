"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { registrarAcao } from "@/lib/admin/audit";
import { slugify } from "@/lib/admin/slug";

export type ProdutoState = { ok?: boolean; erro?: string } | null;

export async function salvarProduto(_prev: ProdutoState, formData: FormData): Promise<ProdutoState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const nome = String(formData.get("nome") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "").trim();
  const preco = Number(formData.get("preco") ?? 0) || 0;
  const ativo = formData.get("ativo") === "on";
  let slug = String(formData.get("slug") ?? "").trim();
  if (!slug) slug = slugify(nome);
  if (nome.length < 2) return { erro: "Informe o nome." };
  if (!tipo) return { erro: "Informe o tipo." };
  if (!slug) return { erro: "Slug inválido." };

  const supabase = await createClient();
  if (id) {
    const { error } = await supabase.from("products").update({ nome, slug, tipo, preco, ativo }).eq("id", id);
    if (error) return { erro: error.code === "23505" ? "Já existe um produto com esse slug." : "Não foi possível salvar." };
    await registrarAcao("update_product", { entidade: "products", entidadeId: id });
  } else {
    const { data, error } = await supabase.from("products").insert({ nome, slug, tipo, preco, ativo }).select("id").single();
    if (error) return { erro: error.code === "23505" ? "Já existe um produto com esse slug." : "Não foi possível criar." };
    await registrarAcao("create_product", { entidade: "products", entidadeId: data.id });
  }
  revalidatePath("/admin/produtos");
  return { ok: true };
}

export async function alternarAtivoProduto(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const ativo = String(formData.get("ativo") ?? "") === "true";
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("products").update({ ativo: !ativo }).eq("id", id);
  await registrarAcao("toggle_product", { entidade: "products", entidadeId: id, detalhe: { ativo: !ativo } });
  revalidatePath("/admin/produtos");
}

export async function excluirProduto(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const { count } = await supabase.from("user_products").select("*", { count: "exact", head: true }).eq("product_id", id);
  if ((count ?? 0) > 0) {
    await registrarAcao("delete_product_bloqueado", { entidade: "products", entidadeId: id, detalhe: { vinculos: count } });
    return;
  }
  await supabase.from("products").delete().eq("id", id);
  await registrarAcao("delete_product", { entidade: "products", entidadeId: id });
  revalidatePath("/admin/produtos");
}

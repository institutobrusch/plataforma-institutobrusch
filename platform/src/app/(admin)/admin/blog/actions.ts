"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireBlogAutor } from "@/lib/auth";
import { registrarAcao } from "@/lib/admin/audit";
import { montarNomeArquivo } from "@/lib/admin/carto";
import { slugify } from "@/lib/admin/slug";

export type PostState = { ok?: boolean; erro?: string } | null;

export async function salvarPost(_prev: PostState, fd: FormData): Promise<PostState> {
  const { user, role } = await requireBlogAutor();
  const id = String(fd.get("id") ?? "");
  const titulo = String(fd.get("titulo") ?? "").trim();
  if (!titulo) return { erro: "Informe o título." };
  const slug = (String(fd.get("slug") ?? "").trim() || slugify(titulo));
  const resumo = String(fd.get("resumo") ?? "").trim() || null;
  const data = String(fd.get("data") ?? "").trim() || null;
  const autor = String(fd.get("autor") ?? "").trim() || null;
  const cargo = String(fd.get("cargo") ?? "").trim() || null;
  const publicado = fd.get("publicado") === "on" || fd.get("publicado") === "true";
  const corpo = String(fd.get("corpo") ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
  const supabase = await createClient();

  let imagem_path: string | undefined;
  const img = fd.get("imagem") as File | null;
  if (img && img.size > 0) {
    const nome = montarNomeArquivo(img.name, "blog");
    const { error: upErr } = await supabase.storage.from("capas").upload(nome, img, { contentType: img.type || "application/octet-stream", upsert: false });
    if (upErr) return { erro: "Falha ao enviar a capa." };
    imagem_path = nome;
  }

  const base = { titulo, slug, resumo, data, autor, cargo, publicado, corpo };
  if (id) {
    // colunista só edita os próprios (RLS barra; checagem amigável no server)
    if (role !== "admin") {
      const { data: dono } = await supabase.from("blog_posts").select("author_id").eq("id", id).maybeSingle();
      if (!dono || dono.author_id !== user.id) return { erro: "Você só pode editar os seus posts." };
    }
    const patch: typeof base & { imagem_path?: string } = { ...base };
    if (imagem_path) patch.imagem_path = imagem_path;
    const { error } = await supabase.from("blog_posts").update(patch).eq("id", id);
    if (error) return { erro: error.code === "23505" ? "Já existe um post com esse slug." : "Não foi possível salvar." };
    await registrarAcao("update_blog_post", { entidade: "blog_posts", entidadeId: id });
  } else {
    const { data: row, error } = await supabase.from("blog_posts")
      .insert({ ...base, imagem_path: imagem_path ?? null, author_id: user.id }).select("id").single();
    if (error) return { erro: error.code === "23505" ? "Já existe um post com esse slug." : "Não foi possível criar." };
    await registrarAcao("create_blog_post", { entidade: "blog_posts", entidadeId: row.id });
  }
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  return { ok: true };
}

export async function excluirPost(fd: FormData) {
  const { user, role } = await requireBlogAutor();
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const { data: p } = await supabase.from("blog_posts").select("author_id, imagem_path, slug").eq("id", id).maybeSingle();
  if (!p) return;
  if (role !== "admin" && p.author_id !== user.id) return;
  if (p.imagem_path) await supabase.storage.from("capas").remove([p.imagem_path]);
  await supabase.from("blog_posts").delete().eq("id", id);
  await registrarAcao("delete_blog_post", { entidade: "blog_posts", entidadeId: id });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

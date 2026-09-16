import type { Metadata } from "next";
import Eyebrow from "@/components/Eyebrow";
import PostCard from "@/components/PostCard";
import type { Post } from "@/content";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Textos da Camila, do Instituto Brusch e de colunistas convidados sobre psicologia, autoconhecimento e vínculos.",
};

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("blog_posts")
    .select("slug, titulo, autor, cargo, data, resumo, imagem_path, created_at")
    .eq("publicado", true)
    .order("created_at", { ascending: false });

  const posts: Post[] = (rows ?? []).map((row) => ({
    slug: row.slug,
    titulo: row.titulo,
    autor: row.autor ?? "",
    cargo: row.cargo ?? "",
    data: row.data ?? "",
    resumo: row.resumo ?? "",
    corpo: [],
    imagemUrl: row.imagem_path
      ? supabase.storage.from("capas").getPublicUrl(row.imagem_path).data.publicUrl
      : undefined,
  }));

  return (
    <div className="mx-auto max-w-[1160px] px-6 py-16">
      <Eyebrow>Leituras</Eyebrow>
      <h1 className="mt-2 text-4xl text-ink">Blog do Instituto</h1>
      <p className="mt-3 max-w-[60ch] text-lg text-ink-2">
        Textos da Camila, do instituto e de colunistas convidados.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
    </div>
  );
}

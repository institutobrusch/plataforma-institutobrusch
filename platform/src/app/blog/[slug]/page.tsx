import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPost, getPosts } from "@/content";

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Artigo não encontrado" };
  return { title: post.titulo, description: post.resumo };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-[70ch] px-6 py-16">
      <Link href="/blog" className="text-sm font-semibold text-navy hover:underline">
        ← Voltar ao blog
      </Link>
      <div className="mt-6 text-xs font-medium uppercase tracking-wide text-ink-3">
        {post.data}
      </div>
      <h1 className="mt-2 text-4xl text-ink">{post.titulo}</h1>
      <div className="mt-6 space-y-4 text-lg text-ink-2">
        {post.corpo.map((par, i) => (
          <p key={i}>{par}</p>
        ))}
      </div>
      <footer className="mt-10 border-t border-line pt-5 text-sm">
        <span className="font-semibold text-ink">{post.autor}</span>
        <span className="text-ink-3"> · {post.cargo}</span>
      </footer>
    </article>
  );
}

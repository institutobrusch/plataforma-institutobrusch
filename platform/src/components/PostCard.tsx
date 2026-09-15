import Link from "next/link";
import type { Post } from "@/content";

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-[10px] border border-line bg-surface p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="text-xs font-medium uppercase tracking-wide text-ink-3">
        {post.data} · {post.autor}
      </div>
      <h3 className="mt-2 text-lg font-semibold text-ink group-hover:text-navy">
        {post.titulo}
      </h3>
      <p className="mt-2 text-sm text-ink-2">{post.resumo}</p>
      <span className="mt-4 text-sm font-semibold text-navy">Ler artigo →</span>
    </Link>
  );
}

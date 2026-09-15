import type { Metadata } from "next";
import Eyebrow from "@/components/Eyebrow";
import PostCard from "@/components/PostCard";
import { getPosts } from "@/content";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Textos da Camila, do Instituto Brusch e de colunistas convidados sobre psicologia, autoconhecimento e vínculos.",
};

export default function BlogPage() {
  const posts = getPosts();
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

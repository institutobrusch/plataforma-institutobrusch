import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireBlogAutor, getProfile } from "@/lib/auth";
import PostForm from "@/components/admin/PostForm";
import { excluirPost } from "./actions";

export const metadata = { title: "Blog — Admin" };

export default async function BlogAdmin() {
  const { user, role } = await requireBlogAutor();
  const profile = await getProfile();
  const supabase = await createClient();

  let query = supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (role !== "admin") query = query.eq("author_id", user.id);
  const { data: posts } = await query;

  const capaUrl = (path: string | null | undefined) =>
    path ? supabase.storage.from("capas").getPublicUrl(path).data.publicUrl : undefined;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-ink">Blog</h1>
        {role === "admin" && (
          <Link href="/admin/blog/colunistas" className="text-sm text-navy hover:underline">
            Gerenciar colunistas
          </Link>
        )}
      </div>

      <section className="mt-6 rounded-[10px] border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink">Novo post</h2>
        <div className="mt-4">
          <PostForm
            autorPadrao={profile?.nome ?? ""}
            cargoPadrao={role === "colunista" ? "Colunista" : "Equipe"}
          />
        </div>
      </section>

      <ul className="mt-6 space-y-2">
        {(posts ?? []).map((p) => (
          <li key={p.id} className="rounded-lg border border-line bg-surface p-3">
            <details>
              <summary className="cursor-pointer text-sm text-ink">
                {p.titulo}{" "}
                <span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${p.publicado ? "bg-green-100 text-green-800" : "bg-neutral-200 text-neutral-700"}`}>
                  {p.publicado ? "Publicado" : "Rascunho"}
                </span>
              </summary>
              <div className="mt-3">
                <PostForm
                  inicial={p}
                  capaUrl={capaUrl(p.imagem_path)}
                  autorPadrao={profile?.nome ?? ""}
                  cargoPadrao="Equipe"
                />
              </div>
              <form action={excluirPost} className="mt-3">
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" className="text-xs text-red-600 hover:underline">Excluir</button>
              </form>
            </details>
          </li>
        ))}
        {(posts ?? []).length === 0 && <li className="text-sm text-ink-2">Nenhum post.</li>}
      </ul>
    </div>
  );
}

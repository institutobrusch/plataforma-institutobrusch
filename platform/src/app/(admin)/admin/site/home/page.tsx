import Link from "next/link";
import { getConteudo } from "@/lib/site/content";
import HomeForm from "@/components/admin/site/HomeForm";

export const metadata = { title: "Home — Admin" };

export default async function Page() {
  const home = await getConteudo("home");
  return (
    <div className="max-w-4xl">
      <Link href="/admin/site" className="text-sm text-ink-2 transition hover:text-ink">← Voltar</Link>
      <h1 className="mt-2 text-2xl text-ink">Home</h1>
      <p className="mt-1 text-sm text-ink-2">Hero, CTAs, blocos de destaque e SEO da página inicial.</p>
      <HomeForm inicial={home} />
    </div>
  );
}

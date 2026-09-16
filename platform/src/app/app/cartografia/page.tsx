import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMeusProdutos } from "@/lib/auth";
import CartografiaTabs, {
  type SessaoView,
  type MaterialView,
} from "@/components/CartografiaTabs";

export default async function CartografiaAppPage() {
  const produtos = await getMeusProdutos();

  if (!produtos.includes("cartografia")) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-tan">Cartografia</span>
        <h1 className="mt-2 text-2xl text-ink">Você ainda não tem a Cartografia</h1>
        <p className="mx-auto mt-2 max-w-[46ch] text-ink-2">
          Contrate a Cartografia para acessar sua carta, os áudios das sessões e os
          materiais.
        </p>
        <Link
          href="/cartografia"
          className="mt-6 inline-flex rounded-full bg-navy px-6 py-3 text-sm font-semibold text-surface transition hover:bg-navy-d"
        >
          Conhecer a Cartografia
        </Link>
      </div>
    );
  }

  const supabase = await createClient();

  const { data: cartas } = await supabase.from("carto_cartas").select("*").limit(1);
  const c = cartas?.[0] ?? null;
  let cartaImagemUrl: string | undefined;
  if (c?.imagem_path) {
    const { data } = await supabase.storage.from("cartas").createSignedUrl(c.imagem_path, 3600);
    cartaImagemUrl = data?.signedUrl;
  }
  const carta = c
    ? { titulo: c.titulo, explicacao: c.explicacao, topicos: c.topicos ?? [], imagemUrl: cartaImagemUrl }
    : null;

  const { data: sessoesRaw } = await supabase
    .from("carto_sessions")
    .select("*")
    .order("ordem", { ascending: false });

  const sessoes: SessaoView[] = [];
  const sessaoTitulo = new Map<string, string>();
  for (const s of sessoesRaw ?? []) {
    sessaoTitulo.set(s.id, s.titulo);
    let audioUrl: string | undefined;
    if (s.audio_path) {
      const { data } = await supabase.storage.from("audios").createSignedUrl(s.audio_path, 3600);
      audioUrl = data?.signedUrl;
    }
    sessoes.push({ id: s.id, titulo: s.titulo, data: s.data, resumo: s.resumo, audioUrl });
  }

  const { data: materiaisRaw } = await supabase.from("carto_materials").select("*");
  const materiais: MaterialView[] = [];
  for (const m of materiaisRaw ?? []) {
    let url = m.url ?? undefined;
    if (!url && m.arquivo_path) {
      const { data } = await supabase.storage.from("materiais").createSignedUrl(m.arquivo_path, 3600);
      url = data?.signedUrl;
    }
    materiais.push({
      id: m.id,
      titulo: m.titulo,
      tipo: m.tipo,
      sessao: m.session_id ? (sessaoTitulo.get(m.session_id) ?? "") : "",
      url,
    });
  }

  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-tan">Seu produto</span>
      <h1 className="mt-1 text-2xl text-ink">Cartografia</h1>
      <CartografiaTabs carta={carta} sessoes={sessoes} materiais={materiais} />
    </div>
  );
}

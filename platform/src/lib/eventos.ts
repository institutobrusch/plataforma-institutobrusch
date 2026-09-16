import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Evento } from "@/content";

// Lê os eventos ativos do banco e mapeia para o formato usado pelo site
// (EventCard / EventosFilter / página de detalhe). Antes o site lia do seed
// estático, então eventos criados no admin não apareciam.

type Row = {
  slug: string;
  titulo: string;
  tipo: string | null;
  data: string | null;
  local: string | null;
  preco: number | null;
  vagas: string | null;
  descricao: string | null;
  poster_path: string | null;
};

function paraEvento(
  row: Row,
  posterUrl: (p: string) => string,
): Evento {
  return {
    slug: row.slug,
    titulo: row.titulo,
    tipo: row.tipo === "Online" ? "Online" : "Presencial",
    data: row.data ?? "",
    local: row.local ?? "",
    preco: Number(row.preco ?? 0),
    vagas: row.vagas ?? "",
    descricao: row.descricao ?? "",
    posterUrl: row.poster_path ? posterUrl(row.poster_path) : undefined,
  };
}

const COLS = "slug, titulo, tipo, data, local, preco, vagas, descricao, poster_path";

export async function getEventosPublicos(): Promise<Evento[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select(COLS)
    .eq("ativo", true)
    .order("created_at", { ascending: false });
  const url = (p: string) => supabase.storage.from("capas").getPublicUrl(p).data.publicUrl;
  return (data ?? []).map((r) => paraEvento(r as Row, url));
}

export async function getEventoPublico(slug: string): Promise<Evento | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select(COLS)
    .eq("slug", slug)
    .eq("ativo", true)
    .maybeSingle();
  if (!data) return null;
  const url = (p: string) => supabase.storage.from("capas").getPublicUrl(p).data.publicUrl;
  return paraEvento(data as Row, url);
}

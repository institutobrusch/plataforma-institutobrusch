"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { registrarAcao } from "@/lib/admin/audit";
import { slugify } from "@/lib/admin/slug";
import { montarNomeArquivo } from "@/lib/admin/carto";

export type EventoState = { ok?: boolean; erro?: string } | null;

export async function salvarEvento(_prev: EventoState, formData: FormData): Promise<EventoState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim() || null;
  const data = String(formData.get("data") ?? "").trim() || null;
  const local = String(formData.get("local") ?? "").trim() || null;
  // O banco exige tipo IN ('Presencial','Online') (events_tipo_check). Normaliza
  // para não violar o CHECK caso o cliente envie em outra caixa.
  const tipoRaw = String(formData.get("tipo") ?? "").trim().toLowerCase();
  const tipo = tipoRaw === "online" ? "Online" : "Presencial";
  const preco = Number(formData.get("preco") ?? 0) || 0;
  const vagas = String(formData.get("vagas") ?? "").trim() || null;
  const ativo = formData.get("ativo") === "on";
  let slug = String(formData.get("slug") ?? "").trim();
  if (!slug) slug = slugify(titulo);
  if (titulo.length < 2) return { erro: "Informe o título." };
  if (!slug) return { erro: "Slug inválido." };
  const poster = formData.get("poster") as File | null;

  const supabase = await createClient();
  let poster_path: string | undefined;
  if (poster && poster.size > 0) {
    const nome = montarNomeArquivo(poster.name, "eventos");
    const { error: upErr } = await supabase.storage.from("capas").upload(nome, poster, { contentType: poster.type || "image/jpeg", upsert: false });
    if (upErr) return { erro: "Falha ao enviar a capa." };
    poster_path = nome;
  }

  const base = { titulo, slug, descricao, data, local, tipo, preco, vagas, ativo };
  if (id) {
    const patch: typeof base & { poster_path?: string } = { ...base };
    if (poster_path) patch.poster_path = poster_path;
    const { error } = await supabase.from("events").update(patch).eq("id", id);
    if (error) {
      console.error("[eventos] update falhou:", error.code, error.message, error.details, error.hint);
      return { erro: error.code === "23505" ? "Já existe um evento com esse slug." : "Não foi possível salvar." };
    }
    await registrarAcao("update_event", { entidade: "events", entidadeId: id });
  } else {
    const { data: row, error } = await supabase.from("events").insert({ ...base, poster_path: poster_path ?? null }).select("id").single();
    if (error) {
      console.error("[eventos] insert falhou:", error.code, error.message, error.details, error.hint);
      return { erro: error.code === "23505" ? "Já existe um evento com esse slug." : "Não foi possível criar." };
    }
    await registrarAcao("create_event", { entidade: "events", entidadeId: row.id });
  }
  revalidatePath("/admin/eventos");
  return { ok: true };
}

export async function alternarAtivoEvento(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const ativo = String(formData.get("ativo") ?? "") === "true";
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("events").update({ ativo: !ativo }).eq("id", id);
  await registrarAcao("toggle_event", { entidade: "events", entidadeId: id });
  revalidatePath("/admin/eventos");
}

export async function excluirEvento(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const { data: ev } = await supabase.from("events").select("poster_path").eq("id", id).maybeSingle();
  if (ev?.poster_path) await supabase.storage.from("capas").remove([ev.poster_path]);
  await supabase.from("events").delete().eq("id", id);
  await registrarAcao("delete_event", { entidade: "events", entidadeId: id });
  revalidatePath("/admin/eventos");
}

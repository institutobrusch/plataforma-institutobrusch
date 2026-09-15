import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/database.types";

export async function registrarAcao(
  acao: string,
  opts?: { entidade?: string; entidadeId?: string; detalhe?: Record<string, unknown> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase.from("audit_log").insert({
    actor: user?.id ?? null,
    acao,
    entidade: opts?.entidade ?? null,
    entidade_id: opts?.entidadeId ?? null,
    detalhe: (opts?.detalhe ?? null) as Json,
  });
}

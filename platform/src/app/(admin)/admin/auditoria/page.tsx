import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Auditoria — Admin" };

export default async function AuditoriaAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_log")
    .select("id, acao, entidade, entidade_id, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="text-2xl text-ink">Auditoria</h1>
      <div className="mt-4 overflow-x-auto rounded-[10px] border border-line bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-ink-2">
            <tr><th className="px-4 py-2">Quando</th><th className="px-4 py-2">Ação</th><th className="px-4 py-2">Entidade</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(data ?? []).map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2 text-ink-2">{new Date(r.created_at).toLocaleString("pt-BR")}</td>
                <td className="px-4 py-2 text-ink">{r.acao}</td>
                <td className="px-4 py-2 text-ink-2">{r.entidade}{r.entidade_id ? ` · ${r.entidade_id.slice(0, 8)}` : ""}</td>
              </tr>
            ))}
            {(data ?? []).length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-ink-2">Sem registros ainda.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

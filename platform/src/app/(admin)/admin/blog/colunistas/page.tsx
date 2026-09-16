import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import ColunistaForm from "@/components/admin/ColunistaForm";
import { rebaixarColunista } from "./actions";

export const metadata = { title: "Colunistas — Admin" };

export default async function ColunistasAdmin() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: cols } = await supabase
    .from("profiles")
    .select("id, nome")
    .eq("papel", "colunista");

  const emailPorId = new Map<string, string>();
  const admin = createAdminClient();
  const { data: list } = await admin.auth.admin.listUsers();
  for (const u of list?.users ?? []) {
    if (u.email) emailPorId.set(u.id, u.email);
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-ink">Colunistas</h1>
        <Link href="/admin/blog" className="text-sm text-navy hover:underline">
          ← Voltar
        </Link>
      </div>

      <section className="mt-6 rounded-[10px] border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink">Promover colunista</h2>
        <div className="mt-4">
          <ColunistaForm />
        </div>
      </section>

      <ul className="mt-6 space-y-2">
        {(cols ?? []).map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between rounded-lg border border-line bg-surface p-3"
          >
            <div className="text-sm text-ink">
              <span className="font-medium">{c.nome ?? "(sem nome)"}</span>
              <span className="ml-2 text-ink-2">{emailPorId.get(c.id) ?? c.id}</span>
            </div>
            <form action={rebaixarColunista}>
              <input type="hidden" name="id" value={c.id} />
              <button type="submit" className="text-xs text-red-600 hover:underline">
                Rebaixar
              </button>
            </form>
          </li>
        ))}
        {(cols ?? []).length === 0 && (
          <li className="text-sm text-ink-2">Nenhum colunista ainda.</li>
        )}
      </ul>
    </div>
  );
}

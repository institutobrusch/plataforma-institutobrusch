import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import ConviteForm from "@/components/admin/ConviteForm";

export const metadata = { title: "Convites — Admin" };

export default async function ConvitesAdmin() {
  const supabase = await createClient();
  const [{ data: produtos }, { data: convites }] = await Promise.all([
    supabase.from("products").select("id, nome").eq("ativo", true).order("nome"),
    supabase.from("invites").select("id, email, status, expira_em, created_at").order("created_at", { ascending: false }).limit(100),
  ]);
  // Base do link do convite: usa o domínio real que o admin está acessando
  // (cabeçalho da requisição), caindo para a env var só se não houver host.
  // Evita gerar links com "localhost" quando a env não está configurada.
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");
  const siteUrl = host
    ? `${proto}://${host}`
    : (process.env.NEXT_PUBLIC_SITE_URL ?? "");

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <ConviteForm produtos={produtos ?? []} siteUrl={siteUrl} />
      <div>
        <h1 className="text-2xl text-ink">Convites</h1>
        <ul className="mt-4 divide-y divide-line rounded-[10px] border border-line bg-surface">
          {(convites ?? []).map((c) => (
            <li key={c.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-ink">{c.email}</span>
              <span className="text-xs text-ink-2">{c.status}</span>
            </li>
          ))}
          {(convites ?? []).length === 0 && <li className="px-4 py-6 text-sm text-ink-2">Nenhum convite ainda.</li>}
        </ul>
      </div>
    </div>
  );
}

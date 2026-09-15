import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/admin/StatCard";

export const metadata = { title: "Painel — Admin" };

export default async function AdminHome() {
  const supabase = await createClient();
  const inicioMes = new Date();
  inicioMes.setDate(1);
  const inicioMesISO = inicioMes.toISOString().slice(0, 10);

  const [membros, postsPend, depoPend, sugPend, vendasMes] = await Promise.all([
    supabase.from("user_products").select("*", { count: "exact", head: true }).eq("status", "ativo"),
    supabase.from("community_posts").select("*", { count: "exact", head: true }).eq("status", "pendente"),
    supabase.from("testimonials").select("*", { count: "exact", head: true }).eq("status", "pendente"),
    supabase.from("suggestions").select("*", { count: "exact", head: true }).eq("status", "pendente"),
    supabase.from("sales").select("valor").gte("data", inicioMesISO),
  ]);

  const totalVendas = (vendasMes.data ?? []).reduce((s, r) => s + Number(r.valor ?? 0), 0);
  const fmtBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div>
      <h1 className="text-2xl text-ink">Painel</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Acessos ativos" valor={membros.count ?? 0} href="/admin/acessos" />
        <StatCard label="Vendas do mês" valor={fmtBRL.format(totalVendas)} href="/admin/acessos" />
        <StatCard label="Posts pendentes" valor={postsPend.count ?? 0} href="/admin/moderacao" />
        <StatCard label="Depoimentos pendentes" valor={depoPend.count ?? 0} href="/admin/moderacao" />
        <StatCard label="Sugestões pendentes" valor={sugPend.count ?? 0} href="/admin/moderacao" />
      </div>
    </div>
  );
}

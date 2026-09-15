import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CartaForm from "@/components/admin/CartaForm";

export const metadata = { title: "Carta do cliente — Admin" };

export default async function CartaClienteAdmin({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const supabase = await createClient();
  const { data: carta } = await supabase
    .from("carto_cartas").select("titulo, explicacao, topicos").eq("user_id", userId).limit(1).maybeSingle();

  return (
    <div className="max-w-3xl">
      <Link href="/admin/cartografia" className="text-sm text-ink-2 hover:underline">← Voltar aos clientes</Link>
      <h1 className="mt-2 text-2xl text-ink">Cartografia do cliente</h1>
      <div className="mt-6 space-y-8">
        <CartaForm
          userId={userId}
          titulo={carta?.titulo ?? ""}
          explicacao={carta?.explicacao ?? ""}
          topicos={carta?.topicos ?? []}
        />
        {/* Seções Sessões e Materiais adicionadas nas Tasks 5 e 6 */}
      </div>
    </div>
  );
}

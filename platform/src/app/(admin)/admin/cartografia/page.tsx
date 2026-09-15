import Link from "next/link";
import { listarClientesCartografia } from "@/lib/admin/clientes";

export const metadata = { title: "Cartografia — Admin" };

export default async function CartografiaClientesAdmin() {
  const clientes = await listarClientesCartografia();
  return (
    <div>
      <h1 className="text-2xl text-ink">Cartografia por cliente</h1>
      <p className="mt-1 text-sm text-ink-2">Clientes com o produto Cartografia ativo.</p>
      <ul className="mt-6 divide-y divide-line rounded-[10px] border border-line bg-surface">
        {clientes.map((c) => (
          <li key={c.id}>
            <Link href={`/admin/cartografia/${c.id}`} className="flex items-center justify-between px-4 py-3 transition hover:bg-tan-bg">
              <span className="text-sm font-medium text-ink">{c.nome || "(sem nome)"}</span>
              <span className="text-xs text-ink-2">{c.email}</span>
            </Link>
          </li>
        ))}
        {clientes.length === 0 && <li className="px-4 py-6 text-sm text-ink-2">Nenhum cliente com Cartografia ativa.</li>}
      </ul>
    </div>
  );
}

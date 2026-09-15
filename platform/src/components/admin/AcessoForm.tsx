"use client";
import { useActionState } from "react";
import { concederAcesso, type AcessoState } from "@/app/(admin)/admin/acessos/actions";

export default function AcessoForm({ produtos }: { produtos: { id: string; nome: string }[] }) {
  const [state, action, pending] = useActionState<AcessoState, FormData>(concederAcesso, null);
  return (
    <form action={action} className="rounded-[10px] border border-line bg-surface p-6">
      <h2 className="font-semibold text-ink">Conceder acesso</h2>
      <div className="mt-4 grid gap-3">
        <input name="email" type="email" placeholder="E-mail do cliente" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        <select name="product_id" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink">
          <option value="">Selecione o produto</option>
          {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-ink-2">
          <input type="checkbox" name="registrar_venda" /> Registrar venda
        </label>
        <input name="valor" type="number" step="0.01" placeholder="Valor (R$)" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      </div>
      {state?.erro && <p className="mt-3 text-sm text-red-600">{state.erro}</p>}
      {state?.ok && <p className="mt-3 text-sm text-green-700">Acesso concedido!</p>}
      <button type="submit" disabled={pending} className="mt-4 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60">
        {pending ? "Concedendo…" : "Conceder"}
      </button>
    </form>
  );
}

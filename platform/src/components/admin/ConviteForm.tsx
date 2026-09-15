"use client";
import { useActionState } from "react";
import { criarConvite, type ConviteState } from "@/app/(admin)/admin/convites/actions";

export default function ConviteForm({ produtos, siteUrl }: { produtos: { id: string; nome: string }[]; siteUrl: string }) {
  const [state, action, pending] = useActionState<ConviteState, FormData>(criarConvite, null);
  return (
    <form action={action} className="rounded-[10px] border border-line bg-surface p-6">
      <h2 className="font-semibold text-ink">Novo convite</h2>
      <div className="mt-4 grid gap-3">
        <input name="email" type="email" placeholder="E-mail do convidado" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        <select name="product_id" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink">
          <option value="">Sem produto (só acesso)</option>
          {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
      </div>
      {state?.erro && <p className="mt-3 text-sm text-red-600">{state.erro}</p>}
      {state?.ok && state.token && (
        <p className="mt-3 break-all text-sm text-green-700">Link: {siteUrl}/convite/{state.token}</p>
      )}
      <button type="submit" disabled={pending} className="mt-4 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60">
        {pending ? "Criando…" : "Criar convite"}
      </button>
    </form>
  );
}

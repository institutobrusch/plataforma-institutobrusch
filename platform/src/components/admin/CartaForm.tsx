"use client";
import { useActionState } from "react";
import { salvarCarta, type CartaState } from "@/app/(admin)/admin/cartografia/[userId]/actions";
import ImagemInput from "@/components/admin/ImagemInput";

export default function CartaForm({
  userId, titulo, explicacao, topicos,
}: { userId: string; titulo: string; explicacao: string; topicos: string[] }) {
  const [state, action, pending] = useActionState<CartaState, FormData>(salvarCarta, null);
  return (
    <form action={action} className="rounded-[10px] border border-line bg-surface p-6">
      <input type="hidden" name="user_id" value={userId} />
      <h2 className="font-semibold text-ink">Carta</h2>
      <div className="mt-4 grid gap-3">
        <input name="titulo" defaultValue={titulo} placeholder="Título da carta" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        <textarea name="explicacao" defaultValue={explicacao} rows={3} placeholder="Explicação" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        <label className="text-sm text-ink-2">Tópicos (um por linha)
          <textarea name="topicos" defaultValue={topicos.join("\n")} rows={5} className="mt-1 block w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        </label>
        <ImagemInput name="imagem" label="Imagem (opcional)" />
      </div>
      {state?.erro && <p className="mt-3 text-sm text-red-600">{state.erro}</p>}
      {state?.ok && <p className="mt-3 text-sm text-green-700">Carta salva!</p>}
      <button type="submit" disabled={pending} className="mt-4 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60">
        {pending ? "Salvando…" : "Salvar carta"}
      </button>
    </form>
  );
}

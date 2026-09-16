"use client";
import { useActionState } from "react";
import { salvarFaqItem, type FaqState } from "@/app/(admin)/admin/site/faq/actions";

type FaqInicial = { id?: string; pergunta?: string; resposta?: string; ordem?: number; ativo?: boolean };

const INPUT = "w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink";
const BTN = "justify-self-start rounded-full bg-navy px-5 py-2 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60";

export default function FaqForm({ inicial }: { inicial?: FaqInicial }) {
  const [state, action, pending] = useActionState<FaqState, FormData>(salvarFaqItem, null);
  const editando = Boolean(inicial?.id);
  return (
    <form action={action} className="grid gap-3">
      {inicial?.id && <input type="hidden" name="id" value={inicial.id} />}
      <input name="pergunta" defaultValue={inicial?.pergunta ?? ""} placeholder="Pergunta" className={INPUT} />
      <textarea name="resposta" defaultValue={inicial?.resposta ?? ""} rows={3} placeholder="Resposta" className={INPUT} />
      <div className="flex flex-wrap items-center gap-3">
        <input name="ordem" type="number" defaultValue={inicial?.ordem ?? 0} className="w-24 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        <label className="flex items-center gap-2 text-sm text-ink-2">
          <input type="checkbox" name="ativo" defaultChecked={inicial ? Boolean(inicial.ativo) : true} />
          Ativo
        </label>
      </div>
      {state?.erro && <p className="text-sm text-red-600">{state.erro}</p>}
      {state?.ok && <p className="text-sm text-green-700">Salvo!</p>}
      <button type="submit" disabled={pending} className={BTN}>
        {pending ? "Salvando…" : editando ? "Atualizar item" : "Criar item"}
      </button>
    </form>
  );
}

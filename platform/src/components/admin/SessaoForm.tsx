"use client";
import { useActionState } from "react";
import { salvarSessao, type SessaoState } from "@/app/(admin)/admin/cartografia/[userId]/actions";

type Sessao = { id: string; titulo: string; resumo: string | null; data: string | null; duracao: string | null; ordem: number | null };

export default function SessaoForm({ userId, sessao }: { userId: string; sessao?: Sessao }) {
  const [state, action, pending] = useActionState<SessaoState, FormData>(salvarSessao, null);
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="user_id" value={userId} />
      {sessao && <input type="hidden" name="id" value={sessao.id} />}
      <input name="titulo" defaultValue={sessao?.titulo ?? ""} placeholder="Título da sessão" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <textarea name="resumo" defaultValue={sessao?.resumo ?? ""} rows={2} placeholder="Resumo" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <div className="flex gap-2">
        <input name="data" type="date" defaultValue={sessao?.data ?? ""} className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        <input name="duracao" defaultValue={sessao?.duracao ?? ""} placeholder="Duração (ex.: 12 min)" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        <input name="ordem" type="number" defaultValue={sessao?.ordem ?? 0} className="w-24 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      </div>
      <label className="text-sm text-ink-2">Áudio {sessao ? "(enviar substitui o atual)" : ""}
        <input type="file" name="audio" accept="audio/*" className="mt-1 block w-full text-sm text-ink" />
      </label>
      {state?.erro && <p className="text-sm text-red-600">{state.erro}</p>}
      {state?.ok && <p className="text-sm text-green-700">Salvo!</p>}
      <button type="submit" disabled={pending} className="justify-self-start rounded-full bg-navy px-5 py-2 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60">
        {pending ? "Salvando…" : sessao ? "Atualizar sessão" : "Adicionar sessão"}
      </button>
    </form>
  );
}

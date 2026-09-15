"use client";
import { useActionState } from "react";
import { salvarPensamento, type PensamentoState } from "@/app/(admin)/admin/pensamento/actions";

export default function PensamentoForm() {
  const [state, action, pending] = useActionState<PensamentoState, FormData>(salvarPensamento, null);
  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="rounded-[10px] border border-line bg-surface p-6">
      <h2 className="font-semibold text-ink">Novo pensamento</h2>
      <div className="mt-4 grid gap-3">
        <input name="titulo" placeholder="Título" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        <textarea name="texto" rows={3} placeholder="Texto (opcional)" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        <label className="text-sm text-ink-2">Áudio (mp3)
          <input type="file" name="audio" accept="audio/*" className="mt-1 block w-full text-sm text-ink" />
        </label>
        <label className="text-sm text-ink-2">Data de publicação
          <input type="date" name="data" defaultValue={hoje} className="mt-1 block rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        </label>
        <label className="text-sm text-ink-2">Status
          <select name="status" defaultValue="publicado" className="mt-1 block rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink">
            <option value="publicado">Publicado (ou agendado se data futura)</option>
            <option value="rascunho">Rascunho</option>
          </select>
        </label>
      </div>
      {state?.erro && <p className="mt-3 text-sm text-red-600">{state.erro}</p>}
      {state?.ok && <p className="mt-3 text-sm text-green-700">Salvo!</p>}
      <button type="submit" disabled={pending} className="mt-4 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60">
        {pending ? "Salvando…" : "Salvar"}
      </button>
    </form>
  );
}

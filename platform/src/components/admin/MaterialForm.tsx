"use client";
import { useActionState } from "react";
import { salvarMaterial, type MaterialState } from "@/app/(admin)/admin/cartografia/[userId]/actions";

type Material = { id: string; titulo: string; tipo: string | null; session_id: string | null; url: string | null };
type SessaoOpt = { id: string; titulo: string };

export default function MaterialForm({ userId, sessoes, material }: { userId: string; sessoes: SessaoOpt[]; material?: Material }) {
  const [state, action, pending] = useActionState<MaterialState, FormData>(salvarMaterial, null);
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="user_id" value={userId} />
      {material && <input type="hidden" name="id" value={material.id} />}
      <input name="titulo" defaultValue={material?.titulo ?? ""} placeholder="Título do material" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <div className="flex flex-wrap gap-2">
        <select name="tipo" defaultValue={material?.tipo ?? "pdf"} className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink">
          <option value="pdf">PDF</option>
          <option value="audio">Áudio</option>
          <option value="texto">Texto</option>
          <option value="link">Link</option>
        </select>
        <select name="session_id" defaultValue={material?.session_id ?? ""} className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink">
          <option value="">Geral da carta (sem sessão)</option>
          {sessoes.map((s) => <option key={s.id} value={s.id}>{s.titulo}</option>)}
        </select>
      </div>
      <input name="url" defaultValue={material?.url ?? ""} placeholder="URL externa (opcional)" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <label className="text-sm text-ink-2">Arquivo {material ? "(enviar substitui o atual)" : "(opcional se usar URL)"}
        <input type="file" name="arquivo" className="mt-1 block w-full text-sm text-ink" />
      </label>
      {state?.erro && <p className="text-sm text-red-600">{state.erro}</p>}
      {state?.ok && <p className="text-sm text-green-700">Salvo!</p>}
      <button type="submit" disabled={pending} className="justify-self-start rounded-full bg-navy px-5 py-2 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60">
        {pending ? "Salvando…" : material ? "Atualizar material" : "Adicionar material"}
      </button>
    </form>
  );
}

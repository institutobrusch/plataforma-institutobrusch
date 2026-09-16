"use client";
import { useActionState } from "react";
import { salvarAula, type AulaState } from "@/app/(admin)/admin/cursos/[id]/actions";

type Aula = { id: string; titulo: string | null; ordem: number | null; youtube_id: string | null };

export default function AulaForm({ courseId, moduleId, aula }: { courseId: string; moduleId: string; aula?: Aula }) {
  const [state, action, pending] = useActionState<AulaState, FormData>(salvarAula, null);
  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="course_id" value={courseId} />
      <input type="hidden" name="module_id" value={moduleId} />
      {aula && <input type="hidden" name="id" value={aula.id} />}
      <div className="flex flex-wrap items-center gap-2">
        <input name="titulo" defaultValue={aula?.titulo ?? ""} placeholder="Título da aula" className="flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        <input name="ordem" type="number" defaultValue={aula?.ordem ?? 0} className="w-20 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      </div>
      <input name="youtube_url" defaultValue={aula?.youtube_id ? `https://youtu.be/${aula.youtube_id}` : ""} placeholder="URL do YouTube" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      {state?.erro && <p className="text-sm text-red-600">{state.erro}</p>}
      {state?.ok && <p className="text-sm text-green-700">Salvo!</p>}
      <button type="submit" disabled={pending} className="justify-self-start rounded-full bg-navy px-4 py-2 text-xs font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60">
        {pending ? "…" : aula ? "Salvar aula" : "Adicionar aula"}
      </button>
    </form>
  );
}

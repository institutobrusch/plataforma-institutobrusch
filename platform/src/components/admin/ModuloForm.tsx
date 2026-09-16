"use client";
import { useActionState } from "react";
import { salvarModulo, type ModuloState } from "@/app/(admin)/admin/cursos/[id]/actions";

type Modulo = { id: string; titulo: string | null; ordem: number | null };

export default function ModuloForm({ courseId, modulo }: { courseId: string; modulo?: Modulo }) {
  const [state, action, pending] = useActionState<ModuloState, FormData>(salvarModulo, null);
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="course_id" value={courseId} />
      {modulo && <input type="hidden" name="id" value={modulo.id} />}
      <input name="titulo" defaultValue={modulo?.titulo ?? ""} placeholder="Título do módulo" className="flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <input name="ordem" type="number" defaultValue={modulo?.ordem ?? 0} className="w-20 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      {state?.erro && <p className="w-full text-sm text-red-600">{state.erro}</p>}
      <button type="submit" disabled={pending} className="rounded-full bg-navy px-4 py-2 text-xs font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60">
        {pending ? "…" : modulo ? "Salvar" : "Adicionar módulo"}
      </button>
    </form>
  );
}

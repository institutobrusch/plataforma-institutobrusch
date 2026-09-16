"use client";
import { useActionState } from "react";
import { salvarCurso, type CursoState } from "@/app/(admin)/admin/cursos/actions";

type Curso = { id: string; titulo: string; slug: string; descricao: string | null; preco: number | null; ativo: boolean | null };

export default function CursoForm({ curso }: { curso?: Curso }) {
  const [state, action, pending] = useActionState<CursoState, FormData>(salvarCurso, null);
  return (
    <form action={action} className="grid gap-3">
      {curso && <input type="hidden" name="id" value={curso.id} />}
      <input name="titulo" defaultValue={curso?.titulo ?? ""} placeholder="Título" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <input name="slug" defaultValue={curso?.slug ?? ""} placeholder="slug (vazio = gerar do título)" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <textarea name="descricao" defaultValue={curso?.descricao ?? ""} rows={3} placeholder="Descrição" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <input name="preco" type="number" step="0.01" defaultValue={curso?.preco ?? 0} placeholder="Preço" className="w-32 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <label className="text-sm text-ink-2">Capa {curso ? "(enviar substitui)" : ""}
        <input type="file" name="capa" accept="image/*" className="mt-1 block w-full text-sm text-ink" />
      </label>
      <label className="flex items-center gap-2 text-sm text-ink-2">
        <input type="checkbox" name="ativo" defaultChecked={curso ? !!curso.ativo : true} /> Ativo
      </label>
      {state?.erro && <p className="text-sm text-red-600">{state.erro}</p>}
      {state?.ok && <p className="text-sm text-green-700">Salvo!</p>}
      <button type="submit" disabled={pending} className="justify-self-start rounded-full bg-navy px-5 py-2 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60">
        {pending ? "Salvando…" : curso ? "Atualizar curso" : "Criar curso"}
      </button>
    </form>
  );
}

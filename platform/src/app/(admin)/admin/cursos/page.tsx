import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CursoForm from "@/components/admin/CursoForm";
import { alternarAtivoCurso, excluirCurso } from "./actions";

export const metadata = { title: "Cursos — Admin" };
const fmtBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function CursosAdmin() {
  const supabase = await createClient();
  const { data: cursos } = await supabase.from("courses").select("id, titulo, slug, descricao, preco, ativo").order("titulo");

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl text-ink">Cursos</h1>
      <section className="mt-6 rounded-[10px] border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink">Novo curso</h2>
        <div className="mt-4"><CursoForm /></div>
      </section>
      <ul className="mt-6 space-y-2">
        {(cursos ?? []).map((c) => (
          <li key={c.id} className="rounded-lg border border-line bg-surface p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink">{c.titulo} <span className="text-xs text-ink-2">· {fmtBRL.format(Number(c.preco ?? 0))} · {c.ativo ? "ativo" : "inativo"}</span></span>
              <div className="flex items-center gap-3">
                <Link href={`/admin/cursos/${c.id}`} className="text-xs text-navy hover:underline">Módulos e aulas</Link>
                <form action={alternarAtivoCurso}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="ativo" value={String(c.ativo)} />
                  <button type="submit" className="text-xs text-ink-2 hover:underline">{c.ativo ? "Desativar" : "Ativar"}</button>
                </form>
                <form action={excluirCurso}>
                  <input type="hidden" name="id" value={c.id} />
                  <button type="submit" className="text-xs text-red-600 hover:underline">Excluir</button>
                </form>
              </div>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-ink-2">Editar dados</summary>
              <div className="mt-3"><CursoForm curso={c} /></div>
            </details>
          </li>
        ))}
        {(cursos ?? []).length === 0 && <li className="text-sm text-ink-2">Nenhum curso.</li>}
      </ul>
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ModuloForm from "@/components/admin/ModuloForm";
import AulaForm from "@/components/admin/AulaForm";
import { excluirModulo, excluirAula } from "./actions";

export const metadata = { title: "Estrutura do curso — Admin" };

export default async function CursoEstruturaAdmin({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = await params;
  const supabase = await createClient();
  const [{ data: curso }, { data: modulos }, { data: aulas }] = await Promise.all([
    supabase.from("courses").select("titulo").eq("id", courseId).maybeSingle(),
    supabase.from("course_modules").select("id, titulo, ordem").eq("course_id", courseId).order("ordem", { ascending: true }),
    supabase.from("course_lessons").select("id, titulo, ordem, youtube_id, module_id").eq("course_id", courseId).order("ordem", { ascending: true }),
  ]);
  const aulasPorModulo = new Map<string, typeof aulas>();
  for (const a of aulas ?? []) {
    if (!a.module_id) continue;
    const arr = aulasPorModulo.get(a.module_id) ?? [];
    arr.push(a);
    aulasPorModulo.set(a.module_id, arr);
  }

  return (
    <div className="max-w-3xl">
      <Link href="/admin/cursos" className="text-sm text-ink-2 hover:underline">← Voltar aos cursos</Link>
      <h1 className="mt-2 text-2xl text-ink">{curso?.titulo ?? "Curso"}</h1>

      <section className="mt-6 rounded-[10px] border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink">Novo módulo</h2>
        <div className="mt-3"><ModuloForm courseId={courseId} /></div>
      </section>

      <div className="mt-6 space-y-3">
        {(modulos ?? []).map((m) => (
          <div key={m.id} className="rounded-[10px] border border-line bg-surface p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-ink">{m.titulo} <span className="text-xs text-ink-2">· ordem {m.ordem ?? 0}</span></span>
              <form action={excluirModulo}>
                <input type="hidden" name="course_id" value={courseId} />
                <input type="hidden" name="id" value={m.id} />
                <button type="submit" className="text-xs text-red-600 hover:underline">Excluir módulo</button>
              </form>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-ink-2">Editar módulo</summary>
              <div className="mt-2"><ModuloForm courseId={courseId} modulo={m} /></div>
            </details>

            <div className="mt-3 border-t border-line pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">Aulas</p>
              <ul className="mt-2 space-y-2">
                {(aulasPorModulo.get(m.id) ?? []).map((a) => (
                  <li key={a!.id} className="rounded-lg border border-line p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-ink">{a!.titulo} <span className="text-xs text-ink-2">· ordem {a!.ordem ?? 0}{a!.youtube_id ? " · vídeo" : ""}</span></span>
                      <form action={excluirAula}>
                        <input type="hidden" name="course_id" value={courseId} />
                        <input type="hidden" name="id" value={a!.id} />
                        <button type="submit" className="text-xs text-red-600 hover:underline">Excluir</button>
                      </form>
                    </div>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-ink-2">Editar aula</summary>
                      <div className="mt-2"><AulaForm courseId={courseId} moduleId={m.id} aula={a!} /></div>
                    </details>
                  </li>
                ))}
                {(aulasPorModulo.get(m.id) ?? []).length === 0 && <li className="text-xs text-ink-2">Sem aulas neste módulo.</li>}
              </ul>
              <div className="mt-3 rounded-lg border border-dashed border-line p-3">
                <p className="mb-2 text-xs font-medium text-ink-2">Nova aula</p>
                <AulaForm courseId={courseId} moduleId={m.id} />
              </div>
            </div>
          </div>
        ))}
        {(modulos ?? []).length === 0 && <p className="text-sm text-ink-2">Nenhum módulo ainda.</p>}
      </div>
    </div>
  );
}

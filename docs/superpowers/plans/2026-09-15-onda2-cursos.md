# Onda 2 — Cursos (admin CRUD + vitrine pública) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** O admin gerencia cursos, módulos e aulas (YouTube); a vitrine pública `/cursos` passa a listar do banco. Assistir/gating por compra ficam para a Onda 4.

**Architecture:** `/admin/cursos` (lista + form) e `/admin/cursos/[id]` (módulos + aulas) com Server Actions após `requireAdmin()` e auditoria; capa no bucket público `capas`; aula guarda `youtube_id` extraído da URL via `youtubeId`. Sem migração (RLS já pronto). Vitrine pública lê `courses` ativos.

**Tech Stack:** Next.js 16 (App Router, RSC, Server Actions, params async), React 19 (`useActionState`), TypeScript, Tailwind v4, Supabase (Postgres/Storage), Vitest.

**Referência da spec:** `docs/superpowers/specs/2026-09-15-onda2-cursos-design.md`

---

## Convenções

- Comandos em `platform/`. Windows: Bash (heredoc) ou PowerShell.
- Commits no repo root, terminando com `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. **Não** dar push.
- `requireAdmin` de `@/lib/auth`; `registrarAcao` de `@/lib/admin/audit`; `createClient` de `@/lib/supabase/server`; `slugify` de `@/lib/admin/slug`; `montarNomeArquivo` de `@/lib/admin/carto`; `youtubeId` de `@/lib/youtube`.
- Pastas com parênteses (`(admin)`, `(site)`) → aspas no git.
- Tokens: line, surface, bg, ink, ink-2, ink-3, navy, navy-d.
- Slug duplicado → Postgres `23505` → mensagem amigável.

## Estrutura de arquivos

- Modificar `src/components/admin/AdminShell.tsx` (menu).
- `src/app/(admin)/admin/cursos/{actions.ts,page.tsx}` + `src/components/admin/CursoForm.tsx`.
- `src/app/(admin)/admin/cursos/[id]/{actions.ts,page.tsx}` + `src/components/admin/ModuloForm.tsx` + `src/components/admin/AulaForm.tsx`.
- Modificar `src/app/(site)/cursos/page.tsx`.

---

## Task 1: Menu + `/admin/cursos` (CRUD do curso)

**Files:** Modify `src/components/admin/AdminShell.tsx`; Create `src/app/(admin)/admin/cursos/actions.ts`, `.../cursos/page.tsx`, `src/components/admin/CursoForm.tsx`.

- [ ] **Step 1: Menu** — em `src/components/admin/AdminShell.tsx`, no array `MENU`, adicionar após a linha de E-books (antes de Depoimentos, ou logo após — desde que exista):
```tsx
  { href: "/admin/cursos", label: "Cursos" },
```
Ler o arquivo e inserir só essa linha.

- [ ] **Step 2: Actions** — `src/app/(admin)/admin/cursos/actions.ts`:
```ts
"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { registrarAcao } from "@/lib/admin/audit";
import { slugify } from "@/lib/admin/slug";
import { montarNomeArquivo } from "@/lib/admin/carto";

export type CursoState = { ok?: boolean; erro?: string } | null;

export async function salvarCurso(_prev: CursoState, formData: FormData): Promise<CursoState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim() || null;
  const preco = Number(formData.get("preco") ?? 0) || 0;
  const ativo = formData.get("ativo") === "on";
  let slug = String(formData.get("slug") ?? "").trim();
  if (!slug) slug = slugify(titulo);
  if (titulo.length < 2) return { erro: "Informe o título." };
  if (!slug) return { erro: "Slug inválido." };
  const capa = formData.get("capa") as File | null;

  const supabase = await createClient();
  let capa_path: string | undefined;
  if (capa && capa.size > 0) {
    const nome = montarNomeArquivo(capa.name, "cursos");
    const { error } = await supabase.storage.from("capas").upload(nome, capa, { contentType: capa.type || "image/jpeg", upsert: false });
    if (error) return { erro: "Falha ao enviar a capa." };
    capa_path = nome;
  }

  const base = { titulo, slug, descricao, preco, ativo };
  if (id) {
    const patch: typeof base & { capa_path?: string } = { ...base };
    if (capa_path) patch.capa_path = capa_path;
    const { error } = await supabase.from("courses").update(patch).eq("id", id);
    if (error) return { erro: error.code === "23505" ? "Já existe um curso com esse slug." : "Não foi possível salvar." };
    await registrarAcao("update_course", { entidade: "courses", entidadeId: id });
  } else {
    const { data: row, error } = await supabase.from("courses").insert({ ...base, capa_path: capa_path ?? null }).select("id").single();
    if (error) return { erro: error.code === "23505" ? "Já existe um curso com esse slug." : "Não foi possível criar." };
    await registrarAcao("create_course", { entidade: "courses", entidadeId: row.id });
  }
  revalidatePath("/admin/cursos");
  revalidatePath("/cursos");
  return { ok: true };
}

export async function alternarAtivoCurso(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const ativo = String(formData.get("ativo") ?? "") === "true";
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("courses").update({ ativo: !ativo }).eq("id", id);
  await registrarAcao("toggle_course", { entidade: "courses", entidadeId: id });
  revalidatePath("/admin/cursos");
  revalidatePath("/cursos");
}

export async function excluirCurso(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const { data: c } = await supabase.from("courses").select("capa_path").eq("id", id).maybeSingle();
  await supabase.from("course_lessons").delete().eq("course_id", id);
  await supabase.from("course_modules").delete().eq("course_id", id);
  if (c?.capa_path) await supabase.storage.from("capas").remove([c.capa_path]);
  await supabase.from("courses").delete().eq("id", id);
  await registrarAcao("delete_course", { entidade: "courses", entidadeId: id });
  revalidatePath("/admin/cursos");
  revalidatePath("/cursos");
}
```

- [ ] **Step 3: CursoForm** — `src/components/admin/CursoForm.tsx`:
```tsx
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
```

- [ ] **Step 4: Página** — `src/app/(admin)/admin/cursos/page.tsx`:
```tsx
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
```

- [ ] **Step 5: Verificar** — `npx tsc --noEmit` passa; `npx vitest run` verde. (`/admin/cursos/[id]` ainda não existe — o link levará a 404 até a Task 2; não quebra build.)

- [ ] **Step 6: Commit**
```
git add platform/src/components/admin/AdminShell.tsx "platform/src/app/(admin)/admin/cursos/actions.ts" "platform/src/app/(admin)/admin/cursos/page.tsx" platform/src/components/admin/CursoForm.tsx
git commit -m "feat(admin): CRUD de cursos (dados, capa, ativar/desativar, excluir em cascata) + menu"
```

---

## Task 2: `/admin/cursos/[id]` — módulos + aulas

**Files:** Create `src/app/(admin)/admin/cursos/[id]/actions.ts`, `.../[id]/page.tsx`, `src/components/admin/ModuloForm.tsx`, `src/components/admin/AulaForm.tsx`.

- [ ] **Step 1: Actions** — `src/app/(admin)/admin/cursos/[id]/actions.ts`:
```ts
"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { registrarAcao } from "@/lib/admin/audit";
import { youtubeId } from "@/lib/youtube";

export type ModuloState = { ok?: boolean; erro?: string } | null;
export type AulaState = { ok?: boolean; erro?: string } | null;

export async function salvarModulo(_prev: ModuloState, formData: FormData): Promise<ModuloState> {
  await requireAdmin();
  const courseId = String(formData.get("course_id") ?? "");
  const id = String(formData.get("id") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  const ordem = Number(formData.get("ordem") ?? 0) || 0;
  if (!courseId) return { erro: "Curso inválido." };
  if (titulo.length < 2) return { erro: "Informe o título do módulo." };

  const supabase = await createClient();
  if (id) {
    const { error } = await supabase.from("course_modules").update({ titulo, ordem }).eq("id", id);
    if (error) return { erro: "Não foi possível salvar o módulo." };
    await registrarAcao("update_module", { entidade: "course_modules", entidadeId: id });
  } else {
    const { error } = await supabase.from("course_modules").insert({ course_id: courseId, titulo, ordem });
    if (error) return { erro: "Não foi possível criar o módulo." };
    await registrarAcao("create_module", { entidade: "course_modules", entidadeId: courseId });
  }
  revalidatePath(`/admin/cursos/${courseId}`);
  return { ok: true };
}

export async function excluirModulo(formData: FormData) {
  await requireAdmin();
  const courseId = String(formData.get("course_id") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("course_lessons").delete().eq("module_id", id);
  await supabase.from("course_modules").delete().eq("id", id);
  await registrarAcao("delete_module", { entidade: "course_modules", entidadeId: id });
  revalidatePath(`/admin/cursos/${courseId}`);
}

export async function salvarAula(_prev: AulaState, formData: FormData): Promise<AulaState> {
  await requireAdmin();
  const courseId = String(formData.get("course_id") ?? "");
  const moduleId = String(formData.get("module_id") ?? "");
  const id = String(formData.get("id") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  const ordem = Number(formData.get("ordem") ?? 0) || 0;
  const urlBruta = String(formData.get("youtube_url") ?? "").trim();
  if (!courseId || !moduleId) return { erro: "Módulo inválido." };
  if (titulo.length < 2) return { erro: "Informe o título da aula." };
  const yid = urlBruta ? youtubeId(urlBruta) : null;
  if (urlBruta && !yid) return { erro: "URL do YouTube inválida." };

  const supabase = await createClient();
  if (id) {
    const { error } = await supabase.from("course_lessons").update({ titulo, ordem, youtube_id: yid }).eq("id", id);
    if (error) return { erro: "Não foi possível salvar a aula." };
    await registrarAcao("update_lesson", { entidade: "course_lessons", entidadeId: id });
  } else {
    const { error } = await supabase.from("course_lessons").insert({ course_id: courseId, module_id: moduleId, titulo, ordem, youtube_id: yid });
    if (error) return { erro: "Não foi possível criar a aula." };
    await registrarAcao("create_lesson", { entidade: "course_lessons", entidadeId: courseId });
  }
  revalidatePath(`/admin/cursos/${courseId}`);
  return { ok: true };
}

export async function excluirAula(formData: FormData) {
  await requireAdmin();
  const courseId = String(formData.get("course_id") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("course_lessons").delete().eq("id", id);
  await registrarAcao("delete_lesson", { entidade: "course_lessons", entidadeId: id });
  revalidatePath(`/admin/cursos/${courseId}`);
}
```

- [ ] **Step 2: ModuloForm** — `src/components/admin/ModuloForm.tsx`:
```tsx
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
```

- [ ] **Step 3: AulaForm** — `src/components/admin/AulaForm.tsx`:
```tsx
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
```

- [ ] **Step 4: Página** — `src/app/(admin)/admin/cursos/[id]/page.tsx`:
```tsx
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
```

- [ ] **Step 5: Verificar** — `npx tsc --noEmit` passa; `npx vitest run` verde. Manual: criar módulo; adicionar aula com URL do YouTube (válida → salva; inválida → erro); editar; excluir aula/módulo.

- [ ] **Step 6: Commit**
```
git add "platform/src/app/(admin)/admin/cursos/[id]" platform/src/components/admin/ModuloForm.tsx platform/src/components/admin/AulaForm.tsx
git commit -m "feat(admin): estrutura do curso — CRUD de módulos e aulas (YouTube)"
```

---

## Task 3: Vitrine pública `/cursos` do banco

**Files:** Modify `src/app/(site)/cursos/page.tsx`.

- [ ] **Step 1: Reescrever `src/app/(site)/cursos/page.tsx`**
```tsx
import type { Metadata } from "next";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Cursos",
  description:
    "Cursos do Instituto Brusch sobre autoconhecimento, paradigma sistêmico e arquétipos — assistidos dentro da plataforma.",
};

const fmtBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function CursosPage() {
  const supabase = await createClient();
  const { data: cursos } = await supabase
    .from("courses")
    .select("id, titulo, descricao, preco, capa_path")
    .eq("ativo", true)
    .order("titulo");

  return (
    <div className="mx-auto max-w-[1160px] px-6 py-16">
      <Eyebrow>Aprendizado</Eyebrow>
      <h1 className="mt-2 text-4xl text-ink">Cursos</h1>
      <p className="mt-3 max-w-[60ch] text-lg text-ink-2">
        Percursos em vídeo para aprofundar temas do autoconhecimento. As aulas ficam
        disponíveis na plataforma, no seu espaço de membro.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(cursos ?? []).map((c) => {
          const capaUrl = c.capa_path
            ? supabase.storage.from("capas").getPublicUrl(c.capa_path).data.publicUrl
            : null;
          return (
            <div key={c.id} className="flex flex-col overflow-hidden rounded-[10px] border border-line bg-surface shadow-sm">
              <div className="flex aspect-[16/10] items-end bg-gradient-to-br from-navy to-navy-d p-5">
                {capaUrl ? (
                  <img src={capaUrl} alt={c.titulo} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <span className="relative font-semibold text-white">{c.titulo}</span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-semibold text-ink">{c.titulo}</h2>
                <p className="mt-1 flex-1 text-sm text-ink-2">{c.descricao}</p>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                  <span className="font-semibold text-navy">{fmtBRL.format(Number(c.preco ?? 0))}</span>
                  <Button href="/contato">Comprar</Button>
                </div>
              </div>
            </div>
          );
        })}
        {(cursos ?? []).length === 0 && <p className="text-ink-2">Em breve.</p>}
      </div>
    </div>
  );
}
```
Nota: se usar `<img>` com `absolute`, o container precisa de `relative`. Ajustar a `div` da capa para incluir `relative` na classe (`flex aspect-[16/10] ... relative`). Verificar visualmente que a capa cobre o card; se preferir simplicidade, pode manter só o título sobre o gradiente quando não houver capa.

- [ ] **Step 2: Verificar** — `npx tsc --noEmit` passa; a página `/cursos` lista cursos ativos do banco.

- [ ] **Step 3: Commit**
```
git add "platform/src/app/(site)/cursos/page.tsx"
git commit -m "feat(cursos): vitrine pública lê do banco (cursos ativos)"
```

---

## Task 4: Fechamento — testes + build

- [ ] **Step 1:** `npx vitest run` — todos verdes.
- [ ] **Step 2:** `npx tsc --noEmit` e `npm run build` — sem erros. Se o validador de rota reclamar, `rm -rf .next` e rebuildar. Confirmar `/admin/cursos`, `/admin/cursos/[id]` e `/cursos` na lista de rotas.
- [ ] **Step 3:** Se houve ajustes, commit:
```
git add -A
git commit -m "chore(cursos): ajustes finais"
```

---

## Self-review (cobertura da spec)

- Menu + curso CRUD (capa, toggle, excluir em cascata, slug) → Task 1. ✅
- Módulos + aulas CRUD (YouTube via URL→id) → Task 2. ✅
- Vitrine pública lê do banco (sem contagem de aulas) → Task 3. ✅
- Auditoria em todas as mutações → Tasks 1–2. ✅
- Sem migração (RLS já pronto) → confirmado em pg_policies. ✅

## Notas

- Aula guarda `youtube_id`; o form aceita a URL e converte (`youtubeId`). No modo
  edição, o campo é pré-preenchido como `https://youtu.be/<id>`.
- Excluir curso apaga aulas e módulos antes (evita órfãos, caso não haja cascade
  no banco). Excluir módulo apaga suas aulas.
- Vitrine sem "N aulas" (aulas protegidas por RLS). Player do cliente + gating por
  compra ficam para a Onda 4 (o RLS `lessons entitlement` já está pronto).
- Capa na vitrine via `<img>` (URL pública do bucket `capas`).

# Onda 2 — CRUD de catálogo (Produtos, Eventos, E-books) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que o admin gerencie o catálogo — Produtos, Eventos e E-books — com criar/editar/ativar-desativar/excluir, upload de capas/posters e do PDF do e-book, slug automático e auditoria.

**Architecture:** Três páginas de admin (`/admin/produtos`, `/admin/eventos`, `/admin/ebooks`) no padrão lista + formulário, com Server Actions após `requireAdmin()` gravando em `audit_log`. RLS admin já existe; nenhuma migração. Slug gerado por helper puro `slugify`. Uploads no Storage (`capas` público, `ebooks` privado). Menu do admin atualizado (inclui Cartografia, que faltava, + as três novas seções).

**Tech Stack:** Next.js 16 (App Router, RSC, Server Actions), React 19 (`useActionState`), TypeScript, Tailwind v4, Supabase (Postgres/Storage), Vitest.

**Referência da spec:** `docs/superpowers/specs/2026-09-15-onda2-crud-catalogo-design.md`

---

## Convenções

- Comandos em `platform/`. Windows: Bash tool (heredoc) ou PowerShell.
- Commits no repo root `C:\Users\PC\Desktop\Instituto Brusch`, terminando com `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. **Não** dar push (o controlador faz).
- `requireAdmin` de `@/lib/auth`; `registrarAcao` de `@/lib/admin/audit`; `createClient` de `@/lib/supabase/server`; `slugify` de `@/lib/admin/slug` (criado na Task 1); `montarNomeArquivo` de `@/lib/admin/carto` (já existe).
- Pastas com parênteses (`(admin)`) → aspas no git.
- Padrão de Server Action e formulário: seguir `src/app/(admin)/admin/cartografia/[userId]/actions.ts` e os forms em `src/components/admin/*`.
- Tokens: line, surface, bg, ink, ink-2, navy, navy-d, tan-bg.

## Estrutura de arquivos

- Criar `src/lib/admin/slug.ts` + `src/lib/admin/slug.test.ts`.
- Modificar `src/components/admin/AdminShell.tsx` (menu).
- Produtos: `src/app/(admin)/admin/produtos/{actions.ts,page.tsx}` + `src/components/admin/ProdutoForm.tsx`.
- Eventos: `src/app/(admin)/admin/eventos/{actions.ts,page.tsx}` + `src/components/admin/EventoForm.tsx`.
- E-books: `src/app/(admin)/admin/ebooks/{actions.ts,page.tsx}` + `src/components/admin/EbookForm.tsx`.

---

## Task 1: slugify (TDD) + menu do admin

**Files:** Create `src/lib/admin/slug.ts`, `src/lib/admin/slug.test.ts`; Modify `src/components/admin/AdminShell.tsx`.

- [ ] **Step 1: Teste que falha** — `src/lib/admin/slug.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("remove acentos e baixa a caixa", () => {
    expect(slugify("Círculo de Outubro")).toBe("circulo-de-outubro");
  });
  it("troca caracteres especiais por hífen e colapsa", () => {
    expect(slugify("E-book: Ansiedade & Você!!")).toBe("e-book-ansiedade-voce");
  });
  it("apara hífens das pontas", () => {
    expect(slugify("  Olá  ")).toBe("ola");
  });
  it("string sem letras vira vazia", () => {
    expect(slugify("---")).toBe("");
  });
});
```

- [ ] **Step 2: Rodar e ver falhar** — `npx vitest run src/lib/admin/slug.test.ts`.

- [ ] **Step 3: Implementar** — `src/lib/admin/slug.ts`:
```ts
export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
```

- [ ] **Step 4: Rodar e ver passar** — `npx vitest run src/lib/admin/slug.test.ts` (4 testes).

- [ ] **Step 5: Atualizar o menu** — em `src/components/admin/AdminShell.tsx`, substituir o array `MENU` por:
```tsx
const MENU = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/pensamento", label: "Pensamento diário" },
  { href: "/admin/moderacao", label: "Moderação" },
  { href: "/admin/cartografia", label: "Cartografia" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/eventos", label: "Eventos" },
  { href: "/admin/ebooks", label: "E-books" },
  { href: "/admin/acessos", label: "Acessos" },
  { href: "/admin/convites", label: "Convites" },
  { href: "/admin/auditoria", label: "Auditoria" },
];
```

- [ ] **Step 6: Verificar** — `npx tsc --noEmit` passa; `npx vitest run` verde.

- [ ] **Step 7: Commit**
```
git add platform/src/lib/admin/slug.ts platform/src/lib/admin/slug.test.ts platform/src/components/admin/AdminShell.tsx
git commit -m "feat(admin): helper slugify (TDD) + itens de catálogo/Cartografia no menu do admin"
```

---

## Task 2: Produtos — CRUD

**Files:** Create `src/app/(admin)/admin/produtos/actions.ts`, `.../produtos/page.tsx`, `src/components/admin/ProdutoForm.tsx`.

- [ ] **Step 1: Actions** — `src/app/(admin)/admin/produtos/actions.ts`:
```ts
"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { registrarAcao } from "@/lib/admin/audit";
import { slugify } from "@/lib/admin/slug";

export type ProdutoState = { ok?: boolean; erro?: string } | null;

export async function salvarProduto(_prev: ProdutoState, formData: FormData): Promise<ProdutoState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const nome = String(formData.get("nome") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "").trim();
  const preco = Number(formData.get("preco") ?? 0) || 0;
  const ativo = formData.get("ativo") === "on";
  let slug = String(formData.get("slug") ?? "").trim();
  if (!slug) slug = slugify(nome);
  if (nome.length < 2) return { erro: "Informe o nome." };
  if (!tipo) return { erro: "Informe o tipo." };
  if (!slug) return { erro: "Slug inválido." };

  const supabase = await createClient();
  if (id) {
    const { error } = await supabase.from("products").update({ nome, slug, tipo, preco, ativo }).eq("id", id);
    if (error) return { erro: error.code === "23505" ? "Já existe um produto com esse slug." : "Não foi possível salvar." };
    await registrarAcao("update_product", { entidade: "products", entidadeId: id });
  } else {
    const { data, error } = await supabase.from("products").insert({ nome, slug, tipo, preco, ativo }).select("id").single();
    if (error) return { erro: error.code === "23505" ? "Já existe um produto com esse slug." : "Não foi possível criar." };
    await registrarAcao("create_product", { entidade: "products", entidadeId: data.id });
  }
  revalidatePath("/admin/produtos");
  return { ok: true };
}

export async function alternarAtivoProduto(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const ativo = String(formData.get("ativo") ?? "") === "true";
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("products").update({ ativo: !ativo }).eq("id", id);
  await registrarAcao("toggle_product", { entidade: "products", entidadeId: id, detalhe: { ativo: !ativo } });
  revalidatePath("/admin/produtos");
}

export async function excluirProduto(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const { count } = await supabase.from("user_products").select("*", { count: "exact", head: true }).eq("product_id", id);
  if ((count ?? 0) > 0) {
    await registrarAcao("delete_product_bloqueado", { entidade: "products", entidadeId: id, detalhe: { vinculos: count } });
    return; // bloqueado: há clientes com este produto
  }
  await supabase.from("products").delete().eq("id", id);
  await registrarAcao("delete_product", { entidade: "products", entidadeId: id });
  revalidatePath("/admin/produtos");
}
```
Nota: `excluirProduto` bloqueia silenciosamente quando há vínculos (a UI mostra o aviso, ver page). Se preferir surfaçar mensagem, seria via state — fora do escopo mínimo aqui.

- [ ] **Step 2: ProdutoForm** — `src/components/admin/ProdutoForm.tsx`:
```tsx
"use client";
import { useActionState } from "react";
import { salvarProduto, type ProdutoState } from "@/app/(admin)/admin/produtos/actions";

type Produto = { id: string; nome: string; slug: string; tipo: string; preco: number; ativo: boolean };

export default function ProdutoForm({ produto }: { produto?: Produto }) {
  const [state, action, pending] = useActionState<ProdutoState, FormData>(salvarProduto, null);
  return (
    <form action={action} className="grid gap-3">
      {produto && <input type="hidden" name="id" value={produto.id} />}
      <input name="nome" defaultValue={produto?.nome ?? ""} placeholder="Nome" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <input name="slug" defaultValue={produto?.slug ?? ""} placeholder="slug (deixe vazio para gerar do nome)" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      {produto && <p className="text-xs text-amber-700">Atenção: mudar o slug de um produto em uso pode quebrar acessos existentes.</p>}
      <div className="flex gap-2">
        <input name="tipo" defaultValue={produto?.tipo ?? ""} placeholder="tipo (ex.: cartografia, curso, ebook)" className="flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        <input name="preco" type="number" step="0.01" defaultValue={produto?.preco ?? 0} placeholder="Preço" className="w-32 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      </div>
      <label className="flex items-center gap-2 text-sm text-ink-2">
        <input type="checkbox" name="ativo" defaultChecked={produto ? produto.ativo : true} /> Ativo
      </label>
      {state?.erro && <p className="text-sm text-red-600">{state.erro}</p>}
      {state?.ok && <p className="text-sm text-green-700">Salvo!</p>}
      <button type="submit" disabled={pending} className="justify-self-start rounded-full bg-navy px-5 py-2 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60">
        {pending ? "Salvando…" : produto ? "Atualizar produto" : "Criar produto"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Página** — `src/app/(admin)/admin/produtos/page.tsx`:
```tsx
import { createClient } from "@/lib/supabase/server";
import ProdutoForm from "@/components/admin/ProdutoForm";
import { alternarAtivoProduto, excluirProduto } from "./actions";

export const metadata = { title: "Produtos — Admin" };
const fmtBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function ProdutosAdmin() {
  const supabase = await createClient();
  const { data: produtos } = await supabase.from("products").select("id, nome, slug, tipo, preco, ativo").order("nome");

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl text-ink">Produtos</h1>
      <section className="mt-6 rounded-[10px] border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink">Novo produto</h2>
        <div className="mt-4"><ProdutoForm /></div>
      </section>
      <ul className="mt-6 space-y-2">
        {(produtos ?? []).map((p) => (
          <li key={p.id} className="rounded-lg border border-line bg-surface p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink">{p.nome} <span className="text-xs text-ink-2">· {p.tipo} · {fmtBRL.format(Number(p.preco ?? 0))} · {p.ativo ? "ativo" : "inativo"}</span></span>
              <div className="flex items-center gap-3">
                <form action={alternarAtivoProduto}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="ativo" value={String(p.ativo)} />
                  <button type="submit" className="text-xs text-ink-2 hover:underline">{p.ativo ? "Desativar" : "Ativar"}</button>
                </form>
                <form action={excluirProduto}>
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" className="text-xs text-red-600 hover:underline">Excluir</button>
                </form>
              </div>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-ink-2">Editar</summary>
              <div className="mt-3"><ProdutoForm produto={{ ...p, preco: Number(p.preco ?? 0) }} /></div>
            </details>
          </li>
        ))}
        {(produtos ?? []).length === 0 && <li className="text-sm text-ink-2">Nenhum produto.</li>}
      </ul>
      <p className="mt-4 text-xs text-ink-2">Excluir um produto com clientes vinculados é bloqueado (aparece registrado na Auditoria). Desative-o em vez de excluir.</p>
    </div>
  );
}
```

- [ ] **Step 4: Verificar** — `npx tsc --noEmit` passa; `npx vitest run` verde. Manual: criar produto (slug automático), editar, desativar/ativar; tentar excluir um com vínculo (não some) e um sem vínculo (some).

- [ ] **Step 5: Commit**
```
git add "platform/src/app/(admin)/admin/produtos" platform/src/components/admin/ProdutoForm.tsx
git commit -m "feat(admin): CRUD de produtos (ativar/desativar, excluir com proteção de vínculo, slug)"
```

---

## Task 3: Eventos — CRUD (com upload de poster)

**Files:** Create `src/app/(admin)/admin/eventos/actions.ts`, `.../eventos/page.tsx`, `src/components/admin/EventoForm.tsx`.

- [ ] **Step 1: Actions** — `src/app/(admin)/admin/eventos/actions.ts`:
```ts
"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { registrarAcao } from "@/lib/admin/audit";
import { slugify } from "@/lib/admin/slug";
import { montarNomeArquivo } from "@/lib/admin/carto";

export type EventoState = { ok?: boolean; erro?: string } | null;

export async function salvarEvento(_prev: EventoState, formData: FormData): Promise<EventoState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim() || null;
  const data = String(formData.get("data") ?? "").trim() || null;
  const local = String(formData.get("local") ?? "").trim() || null;
  const tipo = String(formData.get("tipo") ?? "").trim() || null;
  const preco = Number(formData.get("preco") ?? 0) || 0;
  const vagas = String(formData.get("vagas") ?? "").trim() || null;
  const ativo = formData.get("ativo") === "on";
  let slug = String(formData.get("slug") ?? "").trim();
  if (!slug) slug = slugify(titulo);
  if (titulo.length < 2) return { erro: "Informe o título." };
  if (!slug) return { erro: "Slug inválido." };
  const poster = formData.get("poster") as File | null;

  const supabase = await createClient();
  let poster_path: string | undefined;
  if (poster && poster.size > 0) {
    const nome = montarNomeArquivo(poster.name, "eventos");
    const { error: upErr } = await supabase.storage.from("capas").upload(nome, poster, { contentType: poster.type || "image/jpeg", upsert: false });
    if (upErr) return { erro: "Falha ao enviar a capa." };
    poster_path = nome;
  }

  const base = { titulo, slug, descricao, data, local, tipo, preco, vagas, ativo };
  if (id) {
    const patch: typeof base & { poster_path?: string } = { ...base };
    if (poster_path) patch.poster_path = poster_path;
    const { error } = await supabase.from("events").update(patch).eq("id", id);
    if (error) return { erro: error.code === "23505" ? "Já existe um evento com esse slug." : "Não foi possível salvar." };
    await registrarAcao("update_event", { entidade: "events", entidadeId: id });
  } else {
    const { data: row, error } = await supabase.from("events").insert({ ...base, poster_path: poster_path ?? null }).select("id").single();
    if (error) return { erro: error.code === "23505" ? "Já existe um evento com esse slug." : "Não foi possível criar." };
    await registrarAcao("create_event", { entidade: "events", entidadeId: row.id });
  }
  revalidatePath("/admin/eventos");
  return { ok: true };
}

export async function alternarAtivoEvento(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const ativo = String(formData.get("ativo") ?? "") === "true";
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("events").update({ ativo: !ativo }).eq("id", id);
  await registrarAcao("toggle_event", { entidade: "events", entidadeId: id });
  revalidatePath("/admin/eventos");
}

export async function excluirEvento(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const { data: ev } = await supabase.from("events").select("poster_path").eq("id", id).maybeSingle();
  if (ev?.poster_path) await supabase.storage.from("capas").remove([ev.poster_path]);
  await supabase.from("events").delete().eq("id", id);
  await registrarAcao("delete_event", { entidade: "events", entidadeId: id });
  revalidatePath("/admin/eventos");
}
```
Nota: se `.update(patch)`/`.insert` reclamar de tipos, use objeto tipado explícito (os campos acima) — mantenha o comportamento (poster_path só quando há upload).

- [ ] **Step 2: EventoForm** — `src/components/admin/EventoForm.tsx`:
```tsx
"use client";
import { useActionState } from "react";
import { salvarEvento, type EventoState } from "@/app/(admin)/admin/eventos/actions";

type Evento = { id: string; titulo: string; slug: string; descricao: string | null; data: string | null; local: string | null; tipo: string | null; preco: number | null; vagas: string | null; ativo: boolean | null };

export default function EventoForm({ evento }: { evento?: Evento }) {
  const [state, action, pending] = useActionState<EventoState, FormData>(salvarEvento, null);
  return (
    <form action={action} className="grid gap-3">
      {evento && <input type="hidden" name="id" value={evento.id} />}
      <input name="titulo" defaultValue={evento?.titulo ?? ""} placeholder="Título" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <input name="slug" defaultValue={evento?.slug ?? ""} placeholder="slug (vazio = gerar do título)" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <textarea name="descricao" defaultValue={evento?.descricao ?? ""} rows={3} placeholder="Descrição" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <div className="flex flex-wrap gap-2">
        <input name="data" type="date" defaultValue={evento?.data ?? ""} className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        <select name="tipo" defaultValue={evento?.tipo ?? "presencial"} className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink">
          <option value="presencial">Presencial</option>
          <option value="online">Online</option>
        </select>
        <input name="preco" type="number" step="0.01" defaultValue={evento?.preco ?? 0} placeholder="Preço" className="w-28 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      </div>
      <div className="flex flex-wrap gap-2">
        <input name="local" defaultValue={evento?.local ?? ""} placeholder="Local" className="flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        <input name="vagas" defaultValue={evento?.vagas ?? ""} placeholder="Vagas (ex.: 20)" className="w-32 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      </div>
      <label className="text-sm text-ink-2">Capa/poster {evento ? "(enviar substitui a atual)" : ""}
        <input type="file" name="poster" accept="image/*" className="mt-1 block w-full text-sm text-ink" />
      </label>
      <label className="flex items-center gap-2 text-sm text-ink-2">
        <input type="checkbox" name="ativo" defaultChecked={evento ? !!evento.ativo : true} /> Ativo
      </label>
      {state?.erro && <p className="text-sm text-red-600">{state.erro}</p>}
      {state?.ok && <p className="text-sm text-green-700">Salvo!</p>}
      <button type="submit" disabled={pending} className="justify-self-start rounded-full bg-navy px-5 py-2 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60">
        {pending ? "Salvando…" : evento ? "Atualizar evento" : "Criar evento"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Página** — `src/app/(admin)/admin/eventos/page.tsx`:
```tsx
import { createClient } from "@/lib/supabase/server";
import EventoForm from "@/components/admin/EventoForm";
import { alternarAtivoEvento, excluirEvento } from "./actions";

export const metadata = { title: "Eventos — Admin" };
const fmtBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function EventosAdmin() {
  const supabase = await createClient();
  const { data: eventos } = await supabase
    .from("events").select("id, titulo, slug, descricao, data, local, tipo, preco, vagas, ativo").order("data", { ascending: false });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl text-ink">Eventos</h1>
      <section className="mt-6 rounded-[10px] border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink">Novo evento</h2>
        <div className="mt-4"><EventoForm /></div>
      </section>
      <ul className="mt-6 space-y-2">
        {(eventos ?? []).map((e) => (
          <li key={e.id} className="rounded-lg border border-line bg-surface p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink">{e.titulo} <span className="text-xs text-ink-2">· {e.data ?? "sem data"} · {fmtBRL.format(Number(e.preco ?? 0))} · {e.ativo ? "ativo" : "inativo"}</span></span>
              <div className="flex items-center gap-3">
                <form action={alternarAtivoEvento}>
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="ativo" value={String(e.ativo)} />
                  <button type="submit" className="text-xs text-ink-2 hover:underline">{e.ativo ? "Desativar" : "Ativar"}</button>
                </form>
                <form action={excluirEvento}>
                  <input type="hidden" name="id" value={e.id} />
                  <button type="submit" className="text-xs text-red-600 hover:underline">Excluir</button>
                </form>
              </div>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-ink-2">Editar</summary>
              <div className="mt-3"><EventoForm evento={e} /></div>
            </details>
          </li>
        ))}
        {(eventos ?? []).length === 0 && <li className="text-sm text-ink-2">Nenhum evento.</li>}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Verificar** — `npx tsc --noEmit` passa; `npx vitest run` verde. Manual: criar evento com capa → aparece em `/eventos` (site); editar; desativar (some da vitrine); excluir (some + poster removido do bucket `capas`).

- [ ] **Step 5: Commit**
```
git add "platform/src/app/(admin)/admin/eventos" platform/src/components/admin/EventoForm.tsx
git commit -m "feat(admin): CRUD de eventos com upload de capa, ativar/desativar e excluir"
```

---

## Task 4: E-books — CRUD (upload de capa + PDF)

**Files:** Create `src/app/(admin)/admin/ebooks/actions.ts`, `.../ebooks/page.tsx`, `src/components/admin/EbookForm.tsx`.

- [ ] **Step 1: Actions** — `src/app/(admin)/admin/ebooks/actions.ts`:
```ts
"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { registrarAcao } from "@/lib/admin/audit";
import { slugify } from "@/lib/admin/slug";
import { montarNomeArquivo } from "@/lib/admin/carto";

export type EbookState = { ok?: boolean; erro?: string } | null;

export async function salvarEbook(_prev: EbookState, formData: FormData): Promise<EbookState> {
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
  const arquivo = formData.get("arquivo") as File | null;

  const supabase = await createClient();
  let capa_path: string | undefined;
  if (capa && capa.size > 0) {
    const nome = montarNomeArquivo(capa.name, "ebooks-capas");
    const { error } = await supabase.storage.from("capas").upload(nome, capa, { contentType: capa.type || "image/jpeg", upsert: false });
    if (error) return { erro: "Falha ao enviar a capa." };
    capa_path = nome;
  }
  let arquivo_path: string | undefined;
  if (arquivo && arquivo.size > 0) {
    const nome = montarNomeArquivo(arquivo.name, "ebooks");
    const { error } = await supabase.storage.from("ebooks").upload(nome, arquivo, { contentType: arquivo.type || "application/pdf", upsert: false });
    if (error) return { erro: "Falha ao enviar o arquivo." };
    arquivo_path = nome;
  }

  const base = { titulo, slug, descricao, preco, ativo };
  if (id) {
    const patch: typeof base & { capa_path?: string; arquivo_path?: string } = { ...base };
    if (capa_path) patch.capa_path = capa_path;
    if (arquivo_path) patch.arquivo_path = arquivo_path;
    const { error } = await supabase.from("ebooks").update(patch).eq("id", id);
    if (error) return { erro: error.code === "23505" ? "Já existe um e-book com esse slug." : "Não foi possível salvar." };
    await registrarAcao("update_ebook", { entidade: "ebooks", entidadeId: id });
  } else {
    const { data: row, error } = await supabase.from("ebooks").insert({ ...base, capa_path: capa_path ?? null, arquivo_path: arquivo_path ?? null }).select("id").single();
    if (error) return { erro: error.code === "23505" ? "Já existe um e-book com esse slug." : "Não foi possível criar." };
    await registrarAcao("create_ebook", { entidade: "ebooks", entidadeId: row.id });
  }
  revalidatePath("/admin/ebooks");
  return { ok: true };
}

export async function alternarAtivoEbook(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const ativo = String(formData.get("ativo") ?? "") === "true";
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("ebooks").update({ ativo: !ativo }).eq("id", id);
  await registrarAcao("toggle_ebook", { entidade: "ebooks", entidadeId: id });
  revalidatePath("/admin/ebooks");
}

export async function excluirEbook(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const { data: eb } = await supabase.from("ebooks").select("capa_path, arquivo_path").eq("id", id).maybeSingle();
  if (eb?.capa_path) await supabase.storage.from("capas").remove([eb.capa_path]);
  if (eb?.arquivo_path) await supabase.storage.from("ebooks").remove([eb.arquivo_path]);
  await supabase.from("ebooks").delete().eq("id", id);
  await registrarAcao("delete_ebook", { entidade: "ebooks", entidadeId: id });
  revalidatePath("/admin/ebooks");
}
```

- [ ] **Step 2: EbookForm** — `src/components/admin/EbookForm.tsx`:
```tsx
"use client";
import { useActionState } from "react";
import { salvarEbook, type EbookState } from "@/app/(admin)/admin/ebooks/actions";

type Ebook = { id: string; titulo: string; slug: string; descricao: string | null; preco: number | null; ativo: boolean | null };

export default function EbookForm({ ebook }: { ebook?: Ebook }) {
  const [state, action, pending] = useActionState<EbookState, FormData>(salvarEbook, null);
  return (
    <form action={action} className="grid gap-3">
      {ebook && <input type="hidden" name="id" value={ebook.id} />}
      <input name="titulo" defaultValue={ebook?.titulo ?? ""} placeholder="Título" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <input name="slug" defaultValue={ebook?.slug ?? ""} placeholder="slug (vazio = gerar do título)" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <textarea name="descricao" defaultValue={ebook?.descricao ?? ""} rows={3} placeholder="Descrição" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <input name="preco" type="number" step="0.01" defaultValue={ebook?.preco ?? 0} placeholder="Preço" className="w-32 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <label className="text-sm text-ink-2">Capa {ebook ? "(enviar substitui)" : ""}
        <input type="file" name="capa" accept="image/*" className="mt-1 block w-full text-sm text-ink" />
      </label>
      <label className="text-sm text-ink-2">Arquivo PDF {ebook ? "(enviar substitui)" : ""}
        <input type="file" name="arquivo" accept="application/pdf" className="mt-1 block w-full text-sm text-ink" />
      </label>
      <label className="flex items-center gap-2 text-sm text-ink-2">
        <input type="checkbox" name="ativo" defaultChecked={ebook ? !!ebook.ativo : true} /> Ativo
      </label>
      {state?.erro && <p className="text-sm text-red-600">{state.erro}</p>}
      {state?.ok && <p className="text-sm text-green-700">Salvo!</p>}
      <button type="submit" disabled={pending} className="justify-self-start rounded-full bg-navy px-5 py-2 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60">
        {pending ? "Salvando…" : ebook ? "Atualizar e-book" : "Criar e-book"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Página** — `src/app/(admin)/admin/ebooks/page.tsx`:
```tsx
import { createClient } from "@/lib/supabase/server";
import EbookForm from "@/components/admin/EbookForm";
import { alternarAtivoEbook, excluirEbook } from "./actions";

export const metadata = { title: "E-books — Admin" };
const fmtBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function EbooksAdmin() {
  const supabase = await createClient();
  const { data: ebooks } = await supabase.from("ebooks").select("id, titulo, slug, descricao, preco, ativo").order("titulo");

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl text-ink">E-books</h1>
      <section className="mt-6 rounded-[10px] border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink">Novo e-book</h2>
        <div className="mt-4"><EbookForm /></div>
      </section>
      <ul className="mt-6 space-y-2">
        {(ebooks ?? []).map((eb) => (
          <li key={eb.id} className="rounded-lg border border-line bg-surface p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink">{eb.titulo} <span className="text-xs text-ink-2">· {fmtBRL.format(Number(eb.preco ?? 0))} · {eb.ativo ? "ativo" : "inativo"}</span></span>
              <div className="flex items-center gap-3">
                <form action={alternarAtivoEbook}>
                  <input type="hidden" name="id" value={eb.id} />
                  <input type="hidden" name="ativo" value={String(eb.ativo)} />
                  <button type="submit" className="text-xs text-ink-2 hover:underline">{eb.ativo ? "Desativar" : "Ativar"}</button>
                </form>
                <form action={excluirEbook}>
                  <input type="hidden" name="id" value={eb.id} />
                  <button type="submit" className="text-xs text-red-600 hover:underline">Excluir</button>
                </form>
              </div>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-ink-2">Editar</summary>
              <div className="mt-3"><EbookForm ebook={eb} /></div>
            </details>
          </li>
        ))}
        {(ebooks ?? []).length === 0 && <li className="text-sm text-ink-2">Nenhum e-book.</li>}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Verificar** — `npx tsc --noEmit` passa; `npx vitest run` verde. Manual: criar e-book com capa + PDF → aparece em `/ebooks` (site); editar; desativar; excluir (some + arquivos removidos dos buckets `capas`/`ebooks`).

- [ ] **Step 5: Commit**
```
git add "platform/src/app/(admin)/admin/ebooks" platform/src/components/admin/EbookForm.tsx
git commit -m "feat(admin): CRUD de e-books com upload de capa e PDF, ativar/desativar e excluir"
```

---

## Task 5: Fechamento — testes + build

- [ ] **Step 1:** `npx vitest run` — todos verdes (inclui `slug.test.ts`).
- [ ] **Step 2:** `npx tsc --noEmit` e `npm run build` — sem erros. Se o validador de rota reclamar, `rm -rf .next` e rebuildar. Confirmar `/admin/produtos`, `/admin/eventos`, `/admin/ebooks` na lista de rotas.
- [ ] **Step 3:** Se houve ajustes, commit:
```
git add -A
git commit -m "chore(admin): ajustes finais do CRUD de catálogo"
```

---

## Self-review (cobertura da spec)

- slugify testado + menu (inclui Cartografia) → Task 1. ✅
- Produtos CRUD (toggle, excluir com proteção de vínculo, slug, aviso) → Task 2. ✅
- Eventos CRUD (upload poster, toggle, excluir com remoção de arquivo) → Task 3. ✅
- E-books CRUD (upload capa + PDF, toggle, excluir com remoção de arquivos) → Task 4. ✅
- Auditoria em todas as mutações → Tasks 2–4. ✅
- Slug automático (criar) / manual (editar) + erro de duplicado (23505) → Tasks 2–4. ✅
- RLS admin já existente; sem migração. ✅ (confirmado em pg_policies)

## Notas

- `products.tipo` é texto livre (input); os valores usados no app são como
  `cartografia`, `curso`, `ebook`, `evento`. Mudar o slug de um produto em uso é
  desencorajado por aviso (spec).
- Capas/posters ficam no bucket `capas` (público) → o site pode exibir via URL
  pública; o PDF do e-book fica no bucket `ebooks` (privado) → download via signed
  URL na entrega (fora deste escopo; a venda/entrega é da Onda 4).
- Excluir produto com vínculo é bloqueado silenciosamente na action e registrado
  na Auditoria; a página avisa o admin a desativar em vez de excluir.

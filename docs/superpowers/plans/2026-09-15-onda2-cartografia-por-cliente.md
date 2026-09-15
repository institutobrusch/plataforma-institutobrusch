# Onda 2 — Cartografia por cliente (admin) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que o admin gerencie a Cartografia de cada cliente — carta (título/explicação/imagem/tópicos), sessões (áudio+resumo, CRUD) e materiais (arquivo/URL, por sessão ou gerais da carta, CRUD).

**Architecture:** Rotas `/admin/cartografia` (lista de clientes com o produto) e `/admin/cartografia/[userId]` (painel da carta). Server Actions após `requireAdmin()`, gravando em `audit_log`; uploads/exclusões no Storage server-side. RLS admin já existe (`is_admin()`), então o client comum grava linhas de qualquer cliente; service-role só para listar e-mails.

**Tech Stack:** Next.js 16 (App Router, RSC, Server Actions, params async), React 19 (`useActionState`), TypeScript, Tailwind v4, Supabase (Postgres/Storage), Vitest.

**Referência da spec:** `docs/superpowers/specs/2026-09-15-onda2-cartografia-por-cliente-design.md`

---

## Convenções

- Comandos em `platform/`. Windows: usar Bash tool (heredoc) ou PowerShell.
- Migração via MCP `apply_migration` no projeto `jnwjrjzinqqcxlvleznq`; depois regenerar tipos (`generate_typescript_types` → sobrescrever `src/lib/database.types.ts`).
- Commits no repo root `C:\Users\PC\Desktop\Instituto Brusch`, terminando com `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. **Não** dar push (o controlador faz quando pedido).
- Rota `(admin)` já existe; `requireAdmin` em `@/lib/auth`; `registrarAcao` em `@/lib/admin/audit`; `createClient` em `@/lib/supabase/server`; `createAdminClient` em `@/lib/supabase/admin`.
- Padrão do cliente (referência de buckets/signed URL): `src/app/app/cartografia/page.tsx` — áudio em `audios`, material em `materiais`.
- Pastas com parênteses (`(admin)`) devem ser citadas entre aspas no git.

## Estrutura de arquivos

- Migração `10_carto_material_session_opcional`.
- Criar `src/lib/admin/carto.ts` — `parseTopicos`, `montarNomeArquivo` (puros).
- Criar `src/lib/admin/clientes.ts` — `listarClientesCartografia()`.
- Criar `src/app/(admin)/admin/cartografia/page.tsx` — lista de clientes.
- Criar `src/app/(admin)/admin/cartografia/[userId]/page.tsx` — painel (montado em 3 tasks).
- Criar `src/app/(admin)/admin/cartografia/[userId]/actions.ts` — todas as actions.
- Criar componentes: `src/components/admin/CartaForm.tsx`, `SessaoForm.tsx`, `MaterialForm.tsx`.

---

## Task 1: Migração — session_id opcional

**Files:** Supabase migration `10_carto_material_session_opcional`; Modify `src/lib/database.types.ts`.

- [ ] **Step 1: Aplicar migração** (MCP `apply_migration`, project `jnwjrjzinqqcxlvleznq`, name `10_carto_material_session_opcional`):
```sql
alter table public.carto_materials alter column session_id drop not null;
```

- [ ] **Step 2: Verificar** (MCP `execute_sql`):
```sql
select is_nullable from information_schema.columns
where table_name='carto_materials' and column_name='session_id';
```
Expected: `YES`. Caso contrário, BLOCKED.

- [ ] **Step 3: Regenerar tipos** — MCP `generate_typescript_types` e sobrescrever `src/lib/database.types.ts` (Write). Confirmar que em `carto_materials` o `session_id` do Row passou a `string | null`.

- [ ] **Step 3b: Corrigir o page.tsx do cliente para o novo tipo anulável**
Regenerar os tipos faz `carto_materials.session_id` virar `string | null`. Em `src/app/app/cartografia/page.tsx` a linha
```ts
      sessao: sessaoTitulo.get(m.session_id) ?? "",
```
passa a dar erro de tipo (a chave do Map é `string`). Trocar por um guard de null:
```ts
      sessao: m.session_id ? (sessaoTitulo.get(m.session_id) ?? "") : "",
```
Rodar `npx tsc --noEmit` e confirmar que passa.

- [ ] **Step 4: Commit**
```
git add platform/src/lib/database.types.ts platform/src/app/app/cartografia/page.tsx
git commit -m "feat(db): carto_materials.session_id opcional (materiais gerais da carta)"
```

---

## Task 2: Helpers puros (TDD)

**Files:** Create `src/lib/admin/carto.ts`; Test `src/lib/admin/carto.test.ts`.

- [ ] **Step 1: Teste que falha** — `src/lib/admin/carto.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { parseTopicos, montarNomeArquivo } from "./carto";

describe("parseTopicos", () => {
  it("quebra por linha e remove vazias/espaços", () => {
    expect(parseTopicos("  A \n\n B \n  \nC ")).toEqual(["A", "B", "C"]);
  });
  it("string vazia vira lista vazia", () => {
    expect(parseTopicos("   ")).toEqual([]);
  });
});

describe("montarNomeArquivo", () => {
  it("preserva a extensão em minúsculas", () => {
    expect(montarNomeArquivo("Aula Final.MP3").endsWith(".mp3")).toBe(true);
  });
  it("gera nomes únicos", () => {
    expect(montarNomeArquivo("a.pdf")).not.toBe(montarNomeArquivo("a.pdf"));
  });
  it("aplica prefixo quando informado", () => {
    expect(montarNomeArquivo("a.pdf", "u123").startsWith("u123/")).toBe(true);
  });
  it("usa 'bin' quando não há extensão", () => {
    expect(montarNomeArquivo("semext").endsWith(".bin")).toBe(true);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar** — `npx vitest run src/lib/admin/carto.test.ts` (module not found).

- [ ] **Step 3: Implementar** — `src/lib/admin/carto.ts`:
```ts
export function parseTopicos(texto: string): string[] {
  return texto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

export function montarNomeArquivo(originalName: string, prefixo?: string): string {
  const rawExt = originalName.includes(".") ? originalName.split(".").pop() ?? "" : "";
  const ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "bin";
  const base = crypto.randomUUID();
  const pref = prefixo ? `${prefixo.replace(/[^a-zA-Z0-9_-]/g, "")}/` : "";
  return `${pref}${base}.${ext}`;
}
```

- [ ] **Step 4: Rodar e ver passar** — `npx vitest run src/lib/admin/carto.test.ts` (6 testes PASS).

- [ ] **Step 5: Commit**
```
git add platform/src/lib/admin/carto.ts platform/src/lib/admin/carto.test.ts
git commit -m "feat(admin): helpers parseTopicos e montarNomeArquivo (cartografia) com testes"
```

---

## Task 3: Lista de clientes com Cartografia

**Files:** Create `src/lib/admin/clientes.ts`; Create `src/app/(admin)/admin/cartografia/page.tsx`.

- [ ] **Step 1: Helper** — `src/lib/admin/clientes.ts`:
```ts
import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type ClienteCartografia = { id: string; nome: string; email: string };

export async function listarClientesCartografia(): Promise<ClienteCartografia[]> {
  const supabase = await createClient();
  const { data: ups } = await supabase
    .from("user_products")
    .select("user_id, products!inner(slug)")
    .eq("status", "ativo")
    .eq("products.slug", "cartografia");

  const ids = Array.from(new Set((ups ?? []).map((u) => u.user_id)));
  if (ids.length === 0) return [];

  const { data: profs } = await supabase.from("profiles").select("id, nome").in("id", ids);
  const nomeById = new Map((profs ?? []).map((p) => [p.id, p.nome ?? ""]));

  const admin = createAdminClient();
  const { data: list } = await admin.auth.admin.listUsers();
  const emailById = new Map((list?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  return ids
    .map((id) => ({ id, nome: nomeById.get(id) ?? "", email: emailById.get(id) ?? "" }))
    .sort((a, b) => a.nome.localeCompare(b.nome));
}
```
Note: se `products!inner(slug)` + `.eq("products.slug", ...)` gerar erro de tipos, ajuste mínimo mantendo o filtro (ex.: buscar o `product_id` do slug 'cartografia' em `products` e filtrar `user_products.product_id`). `listUsers()` retorna a 1ª página (até ~50 usuários) — suficiente agora; deixe um comentário `// TODO paginar quando houver muitos usuários`.

- [ ] **Step 2: Página de lista** — `src/app/(admin)/admin/cartografia/page.tsx`:
```tsx
import Link from "next/link";
import { listarClientesCartografia } from "@/lib/admin/clientes";

export const metadata = { title: "Cartografia — Admin" };

export default async function CartografiaClientesAdmin() {
  const clientes = await listarClientesCartografia();
  return (
    <div>
      <h1 className="text-2xl text-ink">Cartografia por cliente</h1>
      <p className="mt-1 text-sm text-ink-2">Clientes com o produto Cartografia ativo.</p>
      <ul className="mt-6 divide-y divide-line rounded-[10px] border border-line bg-surface">
        {clientes.map((c) => (
          <li key={c.id}>
            <Link href={`/admin/cartografia/${c.id}`} className="flex items-center justify-between px-4 py-3 transition hover:bg-tan-bg">
              <span className="text-sm font-medium text-ink">{c.nome || "(sem nome)"}</span>
              <span className="text-xs text-ink-2">{c.email}</span>
            </Link>
          </li>
        ))}
        {clientes.length === 0 && <li className="px-4 py-6 text-sm text-ink-2">Nenhum cliente com Cartografia ativa.</li>}
      </ul>
    </div>
  );
}
```
(Busca client-side pode entrar depois; a lista inicial atende. Não adicionar agora — YAGNI.)

- [ ] **Step 3: Verificar** — `npx tsc --noEmit` passa. Com admin logado, `/admin/cartografia` lista o cliente de teste (que tem Cartografia).

- [ ] **Step 4: Commit**
```
git add platform/src/lib/admin/clientes.ts "platform/src/app/(admin)/admin/cartografia/page.tsx"
git commit -m "feat(admin): lista de clientes com Cartografia ativa"
```

---

## Task 4: Carta — upsert + form + página do cliente (seção Carta)

**Files:** Create `src/app/(admin)/admin/cartografia/[userId]/actions.ts`; Create `src/components/admin/CartaForm.tsx`; Create `src/app/(admin)/admin/cartografia/[userId]/page.tsx`.

- [ ] **Step 1: Actions (carta)** — `src/app/(admin)/admin/cartografia/[userId]/actions.ts`:
```ts
"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { registrarAcao } from "@/lib/admin/audit";
import { parseTopicos, montarNomeArquivo } from "@/lib/admin/carto";

export type CartaState = { ok?: boolean; erro?: string } | null;

export async function salvarCarta(_prev: CartaState, formData: FormData): Promise<CartaState> {
  await requireAdmin();
  const userId = String(formData.get("user_id") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  const explicacao = String(formData.get("explicacao") ?? "").trim() || null;
  const topicos = parseTopicos(String(formData.get("topicos") ?? ""));
  const imagem = formData.get("imagem") as File | null;
  if (!userId) return { erro: "Cliente inválido." };
  if (titulo.length < 2) return { erro: "Informe um título para a carta." };

  const supabase = await createClient();
  const { data: existente } = await supabase
    .from("carto_cartas").select("id, imagem_path").eq("user_id", userId).limit(1).maybeSingle();

  let imagem_path = existente?.imagem_path ?? null;
  if (imagem && imagem.size > 0) {
    const nome = montarNomeArquivo(imagem.name, userId);
    const { error: upErr } = await supabase.storage.from("cartas").upload(nome, imagem, {
      contentType: imagem.type || "image/jpeg", upsert: false,
    });
    if (upErr) return { erro: "Falha ao enviar a imagem." };
    imagem_path = nome;
  }

  if (existente) {
    const { error } = await supabase.from("carto_cartas")
      .update({ titulo, explicacao, topicos, imagem_path }).eq("id", existente.id);
    if (error) return { erro: "Não foi possível salvar a carta." };
  } else {
    const { error } = await supabase.from("carto_cartas")
      .insert({ user_id: userId, titulo, explicacao, topicos, imagem_path });
    if (error) return { erro: "Não foi possível criar a carta." };
  }
  await registrarAcao("save_carta", { entidade: "carto_cartas", entidadeId: userId });
  revalidatePath(`/admin/cartografia/${userId}`);
  return { ok: true };
}
```

- [ ] **Step 2: CartaForm** — `src/components/admin/CartaForm.tsx`:
```tsx
"use client";
import { useActionState } from "react";
import { salvarCarta, type CartaState } from "@/app/(admin)/admin/cartografia/[userId]/actions";

export default function CartaForm({
  userId, titulo, explicacao, topicos,
}: { userId: string; titulo: string; explicacao: string; topicos: string[] }) {
  const [state, action, pending] = useActionState<CartaState, FormData>(salvarCarta, null);
  return (
    <form action={action} className="rounded-[10px] border border-line bg-surface p-6">
      <input type="hidden" name="user_id" value={userId} />
      <h2 className="font-semibold text-ink">Carta</h2>
      <div className="mt-4 grid gap-3">
        <input name="titulo" defaultValue={titulo} placeholder="Título da carta" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        <textarea name="explicacao" defaultValue={explicacao} rows={3} placeholder="Explicação" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        <label className="text-sm text-ink-2">Tópicos (um por linha)
          <textarea name="topicos" defaultValue={topicos.join("\n")} rows={5} className="mt-1 block w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        </label>
        <label className="text-sm text-ink-2">Imagem (opcional)
          <input type="file" name="imagem" accept="image/*" className="mt-1 block w-full text-sm text-ink" />
        </label>
      </div>
      {state?.erro && <p className="mt-3 text-sm text-red-600">{state.erro}</p>}
      {state?.ok && <p className="mt-3 text-sm text-green-700">Carta salva!</p>}
      <button type="submit" disabled={pending} className="mt-4 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60">
        {pending ? "Salvando…" : "Salvar carta"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Página do cliente (só seção Carta por enquanto)** — `src/app/(admin)/admin/cartografia/[userId]/page.tsx`:
```tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CartaForm from "@/components/admin/CartaForm";

export const metadata = { title: "Carta do cliente — Admin" };

export default async function CartaClienteAdmin({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const supabase = await createClient();
  const { data: carta } = await supabase
    .from("carto_cartas").select("titulo, explicacao, topicos").eq("user_id", userId).limit(1).maybeSingle();

  return (
    <div className="max-w-3xl">
      <Link href="/admin/cartografia" className="text-sm text-ink-2 hover:underline">← Voltar aos clientes</Link>
      <h1 className="mt-2 text-2xl text-ink">Cartografia do cliente</h1>
      <div className="mt-6 space-y-8">
        <CartaForm
          userId={userId}
          titulo={carta?.titulo ?? ""}
          explicacao={carta?.explicacao ?? ""}
          topicos={carta?.topicos ?? []}
        />
        {/* Seções Sessões e Materiais adicionadas nas Tasks 5 e 6 */}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verificar** — `npx tsc --noEmit` passa. Abrir `/admin/cartografia/<id>`; salvar a carta; conferir em `/app/cartografia` (logado como o cliente) que título/explicação/tópicos aparecem.

- [ ] **Step 5: Commit**
```
git add "platform/src/app/(admin)/admin/cartografia/[userId]" platform/src/components/admin/CartaForm.tsx
git commit -m "feat(admin): editar carta do cliente (upsert título/explicação/tópicos/imagem)"
```

---

## Task 5: Sessões — CRUD + upload/exclusão de áudio

**Files:** Modify `.../[userId]/actions.ts`; Create `src/components/admin/SessaoForm.tsx`; Modify `.../[userId]/page.tsx`.

- [ ] **Step 1: Actions (sessões)** — acrescentar em `.../[userId]/actions.ts`:
```ts
export type SessaoState = { ok?: boolean; erro?: string } | null;

export async function salvarSessao(_prev: SessaoState, formData: FormData): Promise<SessaoState> {
  await requireAdmin();
  const userId = String(formData.get("user_id") ?? "");
  const id = String(formData.get("id") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  const resumo = String(formData.get("resumo") ?? "").trim() || null;
  const data = String(formData.get("data") ?? "").trim() || null;
  const duracao = String(formData.get("duracao") ?? "").trim() || null;
  const ordem = Number(formData.get("ordem") ?? 0);
  const audio = formData.get("audio") as File | null;
  if (!userId) return { erro: "Cliente inválido." };
  if (titulo.length < 2) return { erro: "Informe um título." };

  const supabase = await createClient();
  let audio_path: string | null = null;
  if (audio && audio.size > 0) {
    const nome = montarNomeArquivo(audio.name, userId);
    const { error: upErr } = await supabase.storage.from("audios").upload(nome, audio, {
      contentType: audio.type || "audio/mpeg", upsert: false,
    });
    if (upErr) return { erro: "Falha ao enviar o áudio." };
    audio_path = nome;
  }

  if (id) {
    const patch: Record<string, unknown> = { titulo, resumo, data, duracao, ordem };
    if (audio_path) patch.audio_path = audio_path;
    const { error } = await supabase.from("carto_sessions").update(patch).eq("id", id);
    if (error) return { erro: "Não foi possível salvar a sessão." };
    await registrarAcao("update_sessao", { entidade: "carto_sessions", entidadeId: id });
  } else {
    const { error } = await supabase.from("carto_sessions")
      .insert({ user_id: userId, titulo, resumo, data, duracao, ordem, audio_path });
    if (error) return { erro: "Não foi possível criar a sessão." };
    await registrarAcao("create_sessao", { entidade: "carto_sessions", entidadeId: userId });
  }
  revalidatePath(`/admin/cartografia/${userId}`);
  return { ok: true };
}

export async function excluirSessao(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("user_id") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const { data: s } = await supabase.from("carto_sessions").select("audio_path").eq("id", id).maybeSingle();
  if (s?.audio_path) await supabase.storage.from("audios").remove([s.audio_path]);
  await supabase.from("carto_sessions").delete().eq("id", id);
  await registrarAcao("delete_sessao", { entidade: "carto_sessions", entidadeId: id });
  revalidatePath(`/admin/cartografia/${userId}`);
}
```
Note: se `.update(patch)` com `Record<string, unknown>` reclamar no tsc, use um objeto tipado (titulo/resumo/data/duracao/ordem + audio_path opcional).

- [ ] **Step 2: SessaoForm (criar e editar)** — `src/components/admin/SessaoForm.tsx`:
```tsx
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
```

- [ ] **Step 3: Seção Sessões na página** — em `.../[userId]/page.tsx`, importar e buscar sessões e renderizar a seção. Adicionar os imports:
```tsx
import SessaoForm from "@/components/admin/SessaoForm";
import { excluirSessao } from "./actions";
```
Buscar as sessões (após a query da carta):
```tsx
  const { data: sessoes } = await supabase
    .from("carto_sessions")
    .select("id, titulo, resumo, data, duracao, ordem, audio_path")
    .eq("user_id", userId)
    .order("ordem", { ascending: false });
```
Adicionar a seção dentro do `<div className="mt-6 space-y-8">`, logo após `<CartaForm .../>` (substituindo o comentário placeholder da seção Sessões):
```tsx
        <section className="rounded-[10px] border border-line bg-surface p-6">
          <h2 className="font-semibold text-ink">Sessões</h2>
          <div className="mt-4 rounded-lg border border-dashed border-line p-4">
            <p className="mb-3 text-sm font-medium text-ink-2">Nova sessão</p>
            <SessaoForm userId={userId} />
          </div>
          <ul className="mt-4 space-y-2">
            {(sessoes ?? []).map((s) => (
              <li key={s.id} className="rounded-lg border border-line p-3">
                <details>
                  <summary className="flex cursor-pointer items-center justify-between text-sm text-ink">
                    <span>{s.titulo} <span className="text-xs text-ink-2">· ordem {s.ordem ?? 0}{s.audio_path ? " · com áudio" : ""}</span></span>
                  </summary>
                  <div className="mt-3">
                    <SessaoForm userId={userId} sessao={s} />
                    <form action={excluirSessao} className="mt-2">
                      <input type="hidden" name="user_id" value={userId} />
                      <input type="hidden" name="id" value={s.id} />
                      <button type="submit" className="text-xs text-red-600 hover:underline">Excluir sessão</button>
                    </form>
                  </div>
                </details>
              </li>
            ))}
            {(sessoes ?? []).length === 0 && <li className="text-sm text-ink-2">Nenhuma sessão ainda.</li>}
          </ul>
        </section>
```

- [ ] **Step 4: Verificar** — `npx tsc --noEmit` passa; `npx vitest run` verde. Manual: adicionar sessão com áudio → aparece na lista e em `/app/cartografia` (áudio toca); editar título; excluir (some da lista e o arquivo sai do bucket `audios`).

- [ ] **Step 5: Commit**
```
git add "platform/src/app/(admin)/admin/cartografia/[userId]" platform/src/components/admin/SessaoForm.tsx
git commit -m "feat(admin): CRUD de sessões da cartografia com upload/exclusão de áudio"
```

---

## Task 6: Materiais — CRUD (arquivo/URL, por sessão ou gerais)

**Files:** Modify `.../[userId]/actions.ts`; Create `src/components/admin/MaterialForm.tsx`; Modify `.../[userId]/page.tsx`.

- [ ] **Step 1: Actions (materiais)** — acrescentar em `.../[userId]/actions.ts`:
```ts
export type MaterialState = { ok?: boolean; erro?: string } | null;

export async function salvarMaterial(_prev: MaterialState, formData: FormData): Promise<MaterialState> {
  await requireAdmin();
  const userId = String(formData.get("user_id") ?? "");
  const id = String(formData.get("id") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "").trim() || null;
  const sessionId = String(formData.get("session_id") ?? "") || null;
  const url = String(formData.get("url") ?? "").trim() || null;
  const arquivo = formData.get("arquivo") as File | null;
  if (!userId) return { erro: "Cliente inválido." };
  if (titulo.length < 2) return { erro: "Informe um título." };

  const supabase = await createClient();
  let arquivo_path: string | null = null;
  if (arquivo && arquivo.size > 0) {
    const nome = montarNomeArquivo(arquivo.name, userId);
    const { error: upErr } = await supabase.storage.from("materiais").upload(nome, arquivo, {
      contentType: arquivo.type || "application/octet-stream", upsert: false,
    });
    if (upErr) return { erro: "Falha ao enviar o arquivo." };
    arquivo_path = nome;
  }

  if (id) {
    const patch: Record<string, unknown> = { titulo, tipo, session_id: sessionId, url };
    if (arquivo_path) patch.arquivo_path = arquivo_path;
    const { error } = await supabase.from("carto_materials").update(patch).eq("id", id);
    if (error) return { erro: "Não foi possível salvar o material." };
    await registrarAcao("update_material", { entidade: "carto_materials", entidadeId: id });
  } else {
    const { error } = await supabase.from("carto_materials")
      .insert({ user_id: userId, session_id: sessionId, titulo, tipo, url, arquivo_path });
    if (error) return { erro: "Não foi possível criar o material." };
    await registrarAcao("create_material", { entidade: "carto_materials", entidadeId: userId });
  }
  revalidatePath(`/admin/cartografia/${userId}`);
  return { ok: true };
}

export async function excluirMaterial(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("user_id") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const { data: m } = await supabase.from("carto_materials").select("arquivo_path").eq("id", id).maybeSingle();
  if (m?.arquivo_path) await supabase.storage.from("materiais").remove([m.arquivo_path]);
  await supabase.from("carto_materials").delete().eq("id", id);
  await registrarAcao("delete_material", { entidade: "carto_materials", entidadeId: id });
  revalidatePath(`/admin/cartografia/${userId}`);
}
```
Note: se `.update(patch)`/`.insert` reclamar no tsc por causa de `session_id` nulo, confirme que os tipos foram regenerados na Task 1 (Row `session_id: string | null`); use objeto tipado se necessário.

- [ ] **Step 2: MaterialForm (criar e editar)** — `src/components/admin/MaterialForm.tsx`:
```tsx
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
```

- [ ] **Step 3: Seção Materiais na página** — em `.../[userId]/page.tsx`, adicionar imports:
```tsx
import MaterialForm from "@/components/admin/MaterialForm";
import { excluirMaterial } from "./actions";
```
Buscar materiais (após as sessões):
```tsx
  const { data: materiais } = await supabase
    .from("carto_materials")
    .select("id, titulo, tipo, session_id, url")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  const sessaoOpts = (sessoes ?? []).map((s) => ({ id: s.id, titulo: s.titulo }));
```
Adicionar a seção após a seção Sessões (dentro do mesmo `space-y-8`):
```tsx
        <section className="rounded-[10px] border border-line bg-surface p-6">
          <h2 className="font-semibold text-ink">Materiais</h2>
          <div className="mt-4 rounded-lg border border-dashed border-line p-4">
            <p className="mb-3 text-sm font-medium text-ink-2">Novo material</p>
            <MaterialForm userId={userId} sessoes={sessaoOpts} />
          </div>
          <ul className="mt-4 space-y-2">
            {(materiais ?? []).map((m) => (
              <li key={m.id} className="rounded-lg border border-line p-3">
                <details>
                  <summary className="flex cursor-pointer items-center justify-between text-sm text-ink">
                    <span>{m.titulo} <span className="text-xs text-ink-2">· {m.tipo ?? "—"}{m.session_id ? " · sessão" : " · carta"}</span></span>
                  </summary>
                  <div className="mt-3">
                    <MaterialForm userId={userId} sessoes={sessaoOpts} material={m} />
                    <form action={excluirMaterial} className="mt-2">
                      <input type="hidden" name="user_id" value={userId} />
                      <input type="hidden" name="id" value={m.id} />
                      <button type="submit" className="text-xs text-red-600 hover:underline">Excluir material</button>
                    </form>
                  </div>
                </details>
              </li>
            ))}
            {(materiais ?? []).length === 0 && <li className="text-sm text-ink-2">Nenhum material ainda.</li>}
          </ul>
        </section>
```

- [ ] **Step 4: Verificar** — `npx tsc --noEmit` passa; `npx vitest run` verde. Manual: adicionar material com arquivo (ex.: PDF) vinculado a uma sessão e outro "geral da carta"; conferir na aba Materiais de `/app/cartografia`; editar e excluir (arquivo sai do bucket `materiais`).

- [ ] **Step 5: Commit**
```
git add "platform/src/app/(admin)/admin/cartografia/[userId]" platform/src/components/admin/MaterialForm.tsx
git commit -m "feat(admin): CRUD de materiais da cartografia (arquivo/URL, por sessão ou gerais da carta)"
```

---

## Task 7: Fechamento — testes + build

**Files:** (nenhum novo)

- [ ] **Step 1:** `npx vitest run` — todos verdes (inclui `carto.test.ts` + pré-existentes).
- [ ] **Step 2:** `npx tsc --noEmit` e `npm run build` — sem erros. Se o validador de rota reclamar, `rm -rf .next` e rebuildar. Confirmar que `/admin/cartografia` e `/admin/cartografia/[userId]` aparecem na lista de rotas.
- [ ] **Step 3:** Se houve ajustes, commit:
```
git add -A
git commit -m "chore(admin): ajustes finais da Cartografia por cliente"
```

---

## Self-review (cobertura da spec)

- Lista de clientes com Cartografia + e-mail via service-role → Task 3. ✅
- `session_id` opcional → Task 1. ✅
- Carta upsert (título/explicação/tópicos/imagem) → Task 4. ✅
- Sessões CRUD + upload/exclusão de áudio → Task 5. ✅
- Materiais CRUD (arquivo/URL, por sessão ou gerais) → Task 6. ✅
- Auditoria em todas as mutações → Tasks 4–6 (`registrarAcao`). ✅
- Helpers puros testados → Task 2. ✅
- RLS admin: já existente, sem migração. ✅ (confirmado em pg_policies)

## Notas

- `listUsers()` traz só a 1ª página; quando houver muitos usuários, paginar (fora de escopo agora).
- A imagem da carta é armazenada mas o `page.tsx` do cliente ainda não a exibe (follow-up).
- Materiais "gerais da carta" aparecem na aba Materiais do cliente com sessão em branco (o `page.tsx` do cliente já trata `session_id` ausente com `?? ""`).

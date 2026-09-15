# Backoffice Admin — Onda 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o núcleo do backoffice admin: base `/admin` protegida por papel, dashboard, gestão do Pensamento diário (com agendamento), moderação unificada, concessão de acesso a produtos (com venda manual), convites e log de auditoria.

**Architecture:** Nova rota `/admin` (route group `(admin)`) no mesmo app Next 16, com `AdminShell` (chrome próprio) e guarda de servidor `requireAdmin()`. Mutações via Server Actions que re-checam `is_admin()` e gravam em `audit_log`. Agendamento do Pensamento diário sem cron: item visível quando `status='publicado' AND data <= hoje`. Convites usam o service-role client para criar a conta do cliente.

**Tech Stack:** Next.js 16 (App Router, RSC, Server Actions), React 19 (`useActionState`), TypeScript, Tailwind v4 (tokens em `globals.css`), Supabase (`@supabase/ssr`, Postgres, Storage, Admin API), Vitest + Testing Library.

**Referência da spec:** `docs/superpowers/specs/2026-09-15-backoffice-admin-design.md`

---

## Convenções e pré-requisitos

- Comandos rodam em `platform/` salvo indicação. No Windows/PowerShell, `cd platform; if ($?) { <cmd> }`.
- Migrações no Supabase via MCP `apply_migration` no projeto `jnwjrjzinqqcxlvleznq`. Após cada migração que altera schema, **regenerar tipos** (Task 1).
- Após mexer em rota/layout, se o validador de tipos reclamar de rota fantasma, `rm -rf .next` e rebuildar.
- Commits frequentes, mensagem no padrão do repo, terminando com:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- `requireAdmin()` faz a proteção de `/admin`; a `Proxy` já cobre todas as rotas (matcher catch-all), então **não** precisa alterar `src/proxy.ts`.

## Estrutura de arquivos (o que será criado/alterado)

**Banco (migrações Supabase):**
- `09_backoffice_onda1` — colunas novas + tabelas `sales`, `audit_log` + RLS + função `has_role`.

**Lib:**
- Modificar `src/lib/auth.ts` — `getMinhaRole()`, `requireAdmin()`.
- Criar `src/lib/supabase/admin.ts` — client service-role (server-only).
- Criar `src/lib/admin/audit.ts` — `registrarAcao()`.
- Criar `src/lib/admin/pensamento.ts` — `pensamentoVisivel()` (lógica pura).
- Criar `src/lib/admin/moderacao.ts` — `montarFilaModeracao()` (lógica pura).
- Criar `src/lib/admin/convite.ts` — `validarConvite()`, `gerarToken()` (lógica pura).

**Rotas admin (`src/app/(admin)/admin/...`):**
- `layout.tsx` (guarda + AdminShell), `page.tsx` (dashboard).
- `pensamento/page.tsx` + `pensamento/actions.ts`.
- `moderacao/page.tsx` + `moderacao/actions.ts`.
- `acessos/page.tsx` + `acessos/actions.ts`.
- `convites/page.tsx` + `convites/actions.ts`.
- `auditoria/page.tsx`.

**Componentes:**
- `src/components/admin/AdminShell.tsx`, `StatCard.tsx`, `PensamentoForm.tsx`, `AcessoForm.tsx`, `ConviteForm.tsx`.

**Área do cliente (ajuste de leitura):**
- Modificar `src/app/app/page.tsx` — filtrar Pensamento por `status='publicado' AND data<=hoje`.

**Resgate de convite:**
- Criar `src/app/convite/[token]/page.tsx` + `src/app/convite/[token]/actions.ts`.

---

## Task 1: Migração de banco (schema Onda 1)

**Files:**
- Supabase migration: `09_backoffice_onda1`
- Modify: `src/lib/database.types.ts` (regenerado)

- [ ] **Step 1: Aplicar a migração**

Via MCP `apply_migration` (projeto `jnwjrjzinqqcxlvleznq`, name `09_backoffice_onda1`):

```sql
-- daily_thoughts: rascunho/publicado (agendamento usa a coluna existente `data`)
alter table public.daily_thoughts
  add column if not exists status text not null default 'publicado'
  check (status in ('rascunho','publicado'));

-- testimonials: moderação + mídia
alter table public.testimonials
  add column if not exists status text not null default 'aprovado'
  check (status in ('pendente','aprovado','recusado'));
alter table public.testimonials
  add column if not exists tipo text not null default 'texto'
  check (tipo in ('texto','imagem','audio','video'));
alter table public.testimonials add column if not exists media_path text;
alter table public.testimonials add column if not exists video_url text;
alter table public.testimonials add column if not exists enviado_por uuid references auth.users(id) on delete set null;

-- sales: venda manual / histórico
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  valor numeric not null default 0,
  data date not null default current_date,
  origem text not null default 'manual',
  observacao text,
  criado_por uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- audit_log: LGPD/auditoria
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor uuid references auth.users(id) on delete set null,
  acao text not null,
  entidade text,
  entidade_id text,
  detalhe jsonb,
  created_at timestamptz not null default now()
);

-- helper de papel (extensível; SECURITY DEFINER só revela o papel do próprio caller)
create or replace function public.has_role(p_role text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and papel = p_role
  );
$$;
revoke execute on function public.has_role(text) from public;
grant execute on function public.has_role(text) to authenticated;

-- RLS
alter table public.sales enable row level security;
alter table public.audit_log enable row level security;

drop policy if exists sales_admin_all on public.sales;
create policy sales_admin_all on public.sales
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists audit_admin_read on public.audit_log;
create policy audit_admin_read on public.audit_log
  for select using (public.is_admin());
drop policy if exists audit_admin_insert on public.audit_log;
create policy audit_admin_insert on public.audit_log
  for insert with check (public.is_admin());
```

- [ ] **Step 2: Verificar a migração**

Via MCP `execute_sql`:

```sql
select
  (select count(*) from information_schema.columns where table_name='daily_thoughts' and column_name='status') as dt_status,
  (select count(*) from information_schema.columns where table_name='testimonials' and column_name='status') as tst_status,
  to_regclass('public.sales') is not null as has_sales,
  to_regclass('public.audit_log') is not null as has_audit;
```

Expected: `dt_status=1, tst_status=1, has_sales=true, has_audit=true`.

- [ ] **Step 3: Rodar os advisors de segurança**

Via MCP `get_advisors` (type `security`). Expected: sem novos ERROR. Um WARN sobre `has_role` ser SECURITY DEFINER é aceitável (só revela o papel do próprio caller), como já ocorre com `is_admin`.

- [ ] **Step 4: Regenerar tipos**

Via MCP `generate_typescript_types` e salvar o resultado sobrescrevendo `src/lib/database.types.ts`.

- [ ] **Step 5: Commit**

```bash
git add platform/src/lib/database.types.ts
git commit -m "feat(db): schema da Onda 1 do backoffice (sales, audit_log, status/agendamento, has_role)"
```

---

## Task 2: Guardas de papel em `auth.ts`

**Files:**
- Modify: `src/lib/auth.ts`
- Test: `src/lib/auth.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

Como `getMinhaRole` depende do Supabase, testamos a **decisão pura** extraída. Criar `src/lib/roles.ts` com a lógica e testá-la.

`src/lib/roles.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { isAdminRole, podeAcessarAdmin } from "./roles";

describe("roles", () => {
  it("admin é admin", () => {
    expect(isAdminRole("admin")).toBe(true);
  });
  it("member não é admin", () => {
    expect(isAdminRole("member")).toBe(false);
  });
  it("papel nulo não acessa admin", () => {
    expect(podeAcessarAdmin(null)).toBe(false);
  });
  it("admin acessa admin", () => {
    expect(podeAcessarAdmin("admin")).toBe(true);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/lib/roles.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implementar `src/lib/roles.ts`**

```ts
export type Papel = "member" | "admin" | "moderador" | "colunista";

export function isAdminRole(papel: string | null | undefined): boolean {
  return papel === "admin";
}

// Onda 1: só admin entra no /admin. Papéis parciais entram na Onda 5.
export function podeAcessarAdmin(papel: string | null | undefined): boolean {
  return isAdminRole(papel);
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/lib/roles.test.ts`
Expected: PASS (4 testes).

- [ ] **Step 5: Adicionar `getMinhaRole` e `requireAdmin` em `src/lib/auth.ts`**

Acrescentar ao final de `src/lib/auth.ts`:

```ts
import { podeAcessarAdmin } from "@/lib/roles";

export async function getMinhaRole(): Promise<string | null> {
  const profile = await getProfile();
  return profile?.papel ?? null;
}

export async function requireAdmin() {
  const user = await getUser();
  if (!user) redirect("/entrar");
  const role = await getMinhaRole();
  if (!podeAcessarAdmin(role)) redirect("/app");
  return user;
}
```

- [ ] **Step 6: Commit**

```bash
git add platform/src/lib/roles.ts platform/src/lib/roles.test.ts platform/src/lib/auth.ts
git commit -m "feat(admin): guarda requireAdmin e lógica de papéis (roles) com testes"
```

---

## Task 3: Client service-role e helper de auditoria

**Files:**
- Create: `src/lib/supabase/admin.ts`
- Create: `src/lib/admin/audit.ts`

- [ ] **Step 1: Criar o client service-role**

`src/lib/supabase/admin.ts` (server-only; nunca importar em componente client):

```ts
import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// Usa a service role key — ignora RLS. Só em Server Actions/route handlers do admin,
// SEMPRE após checar is_admin()/requireAdmin().
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY ausente no ambiente.");
  }
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
```

- [ ] **Step 2: Criar o helper de auditoria**

`src/lib/admin/audit.ts`:

```ts
import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function registrarAcao(
  acao: string,
  opts?: { entidade?: string; entidadeId?: string; detalhe?: Record<string, unknown> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase.from("audit_log").insert({
    actor: user?.id ?? null,
    acao,
    entidade: opts?.entidade ?? null,
    entidade_id: opts?.entidadeId ?? null,
    detalhe: opts?.detalhe ?? null,
  });
}
```

- [ ] **Step 3: Verificar build de tipos**

Run: `npx tsc --noEmit`
Expected: sem erros nos novos arquivos.

- [ ] **Step 4: Commit**

```bash
git add platform/src/lib/supabase/admin.ts platform/src/lib/admin/audit.ts
git commit -m "feat(admin): client service-role e helper registrarAcao (audit_log)"
```

---

## Task 4: Base do admin — AdminShell + layout + guarda

**Files:**
- Create: `src/components/admin/AdminShell.tsx`
- Create: `src/app/(admin)/admin/layout.tsx`
- Create: `src/app/(admin)/admin/page.tsx` (placeholder; dashboard real na Task 5)

- [ ] **Step 1: Criar o AdminShell**

`src/components/admin/AdminShell.tsx`:

```tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const MENU = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/pensamento", label: "Pensamento diário" },
  { href: "/admin/moderacao", label: "Moderação" },
  { href: "/admin/acessos", label: "Acessos" },
  { href: "/admin/convites", label: "Convites" },
  { href: "/admin/auditoria", label: "Auditoria" },
];

export default function AdminShell({
  nome,
  children,
}: {
  nome: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="flex w-60 flex-col border-r border-line bg-surface">
        <div className="border-b border-line px-5 py-4">
          <Link href="/admin">
            <Image src="/brand/logo-navy.png" alt="Instituto Brusch" width={140} height={40} className="logo-light h-8 w-auto" />
            <Image src="/brand/logo-gold.png" alt="Instituto Brusch" width={140} height={40} className="logo-dark h-8 w-auto" />
          </Link>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-tan">Administração</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {MENU.map((item) => {
            const ativo = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  ativo ? "bg-navy text-surface" : "text-ink-2 hover:bg-tan-bg"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line p-3 text-sm">
          <p className="px-3 text-ink-2">{nome}</p>
          <Link href="/app" className="mt-1 block rounded-lg px-3 py-2 text-ink-2 hover:bg-tan-bg">Ver a plataforma</Link>
          <form action="/auth/signout" method="post">
            <button type="submit" className="w-full rounded-lg px-3 py-2 text-left text-ink-2 hover:bg-tan-bg">Sair</button>
          </form>
        </div>
      </aside>
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Criar o layout com guarda**

`src/app/(admin)/admin/layout.tsx`:

```tsx
import { requireAdmin, getProfile } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const profile = await getProfile();
  return <AdminShell nome={profile?.nome ?? "Admin"}>{children}</AdminShell>;
}
```

- [ ] **Step 3: Criar page placeholder**

`src/app/(admin)/admin/page.tsx`:

```tsx
export const metadata = { title: "Painel — Admin" };

export default function AdminHome() {
  return <h1 className="text-2xl text-ink">Painel</h1>;
}
```

- [ ] **Step 4: Verificar guarda (logado não-admin → /app; deslogado → /entrar)**

Run: `npm run dev` e, em outra aba, `curl -sI http://localhost:3000/admin`
Expected: `307` para `/entrar` quando sem sessão. (Com sessão member, redireciona para `/app`; validar manualmente logando com a conta de teste `member`.)

- [ ] **Step 5: Commit**

```bash
git add platform/src/components/admin/AdminShell.tsx "platform/src/app/(admin)"
git commit -m "feat(admin): base do backoffice (route group /admin, AdminShell, requireAdmin)"
```

---

## Task 5: Dashboard com métricas

**Files:**
- Create: `src/components/admin/StatCard.tsx`
- Modify: `src/app/(admin)/admin/page.tsx`

- [ ] **Step 1: Criar StatCard**

`src/components/admin/StatCard.tsx`:

```tsx
import Link from "next/link";

export default function StatCard({
  label,
  valor,
  href,
}: {
  label: string;
  valor: number | string;
  href?: string;
}) {
  const inner = (
    <div className="rounded-[10px] border border-line bg-surface p-5">
      <p className="text-3xl font-semibold text-ink tabular-nums">{valor}</p>
      <p className="mt-1 text-sm text-ink-2">{label}</p>
    </div>
  );
  return href ? <Link href={href} className="block transition hover:border-tan">{inner}</Link> : inner;
}
```

- [ ] **Step 2: Implementar o dashboard**

`src/app/(admin)/admin/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/admin/StatCard";

export const metadata = { title: "Painel — Admin" };

export default async function AdminHome() {
  const supabase = await createClient();
  const inicioMes = new Date();
  inicioMes.setDate(1);
  const inicioMesISO = inicioMes.toISOString().slice(0, 10);

  const [membros, postsPend, depoPend, sugPend, vendasMes] = await Promise.all([
    supabase.from("user_products").select("*", { count: "exact", head: true }).eq("status", "ativo"),
    supabase.from("community_posts").select("*", { count: "exact", head: true }).eq("status", "pendente"),
    supabase.from("testimonials").select("*", { count: "exact", head: true }).eq("status", "pendente"),
    supabase.from("suggestions").select("*", { count: "exact", head: true }).eq("status", "pendente"),
    supabase.from("sales").select("valor").gte("data", inicioMesISO),
  ]);

  const totalVendas = (vendasMes.data ?? []).reduce((s, r) => s + Number(r.valor ?? 0), 0);
  const fmtBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div>
      <h1 className="text-2xl text-ink">Painel</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Acessos ativos" valor={membros.count ?? 0} href="/admin/acessos" />
        <StatCard label="Vendas do mês" valor={fmtBRL.format(totalVendas)} href="/admin/acessos" />
        <StatCard label="Posts pendentes" valor={postsPend.count ?? 0} href="/admin/moderacao" />
        <StatCard label="Depoimentos pendentes" valor={depoPend.count ?? 0} href="/admin/moderacao" />
        <StatCard label="Sugestões pendentes" valor={sugPend.count ?? 0} href="/admin/moderacao" />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verificar build**

Run: `npx tsc --noEmit` e abrir `http://localhost:3000/admin` logado como admin.
Expected: cartões renderizam com contagens (0 ou mais), sem erro.

- [ ] **Step 4: Commit**

```bash
git add platform/src/components/admin/StatCard.tsx "platform/src/app/(admin)/admin/page.tsx"
git commit -m "feat(admin): dashboard com métricas (acessos, vendas do mês, filas pendentes)"
```

---

## Task 6: Pensamento diário — lógica de visibilidade (TDD)

**Files:**
- Create: `src/lib/admin/pensamento.ts`
- Test: `src/lib/admin/pensamento.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

`src/lib/admin/pensamento.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { pensamentoVisivel } from "./pensamento";

const hoje = "2026-09-15";

describe("pensamentoVisivel", () => {
  it("publicado com data de hoje é visível", () => {
    expect(pensamentoVisivel({ status: "publicado", data: "2026-09-15" }, hoje)).toBe(true);
  });
  it("publicado com data passada é visível", () => {
    expect(pensamentoVisivel({ status: "publicado", data: "2026-09-01" }, hoje)).toBe(true);
  });
  it("publicado agendado para o futuro NÃO é visível", () => {
    expect(pensamentoVisivel({ status: "publicado", data: "2026-09-20" }, hoje)).toBe(false);
  });
  it("rascunho nunca é visível", () => {
    expect(pensamentoVisivel({ status: "rascunho", data: "2026-09-01" }, hoje)).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/lib/admin/pensamento.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implementar**

`src/lib/admin/pensamento.ts`:

```ts
export function pensamentoVisivel(
  p: { status: string; data: string },
  hojeISO: string,
): boolean {
  return p.status === "publicado" && p.data <= hojeISO;
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/lib/admin/pensamento.test.ts`
Expected: PASS (4 testes).

- [ ] **Step 5: Commit**

```bash
git add platform/src/lib/admin/pensamento.ts platform/src/lib/admin/pensamento.test.ts
git commit -m "feat(admin): lógica de visibilidade do Pensamento diário (agendamento) com testes"
```

---

## Task 7: Pensamento diário — CRUD + upload + agendamento

**Files:**
- Create: `src/app/(admin)/admin/pensamento/actions.ts`
- Create: `src/components/admin/PensamentoForm.tsx`
- Create: `src/app/(admin)/admin/pensamento/page.tsx`
- Modify: `src/app/app/page.tsx` (aplicar filtro de visibilidade)

- [ ] **Step 1: Criar as Server Actions**

`src/app/(admin)/admin/pensamento/actions.ts`:

```ts
"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { registrarAcao } from "@/lib/admin/audit";

export type PensamentoState = { ok?: boolean; erro?: string } | null;

export async function salvarPensamento(
  _prev: PensamentoState,
  formData: FormData,
): Promise<PensamentoState> {
  await requireAdmin();
  const titulo = String(formData.get("titulo") ?? "").trim();
  const texto = String(formData.get("texto") ?? "").trim() || null;
  const data = String(formData.get("data") ?? "").trim();
  const status = String(formData.get("status") ?? "publicado");
  const audio = formData.get("audio") as File | null;

  if (titulo.length < 2) return { erro: "Informe um título." };
  if (!data) return { erro: "Informe a data de publicação." };
  if (status !== "rascunho" && status !== "publicado") return { erro: "Status inválido." };

  const supabase = await createClient();

  let audio_path: string | null = null;
  if (audio && audio.size > 0) {
    const nome = `${data}-${crypto.randomUUID()}.${(audio.name.split(".").pop() ?? "mp3")}`;
    const { error: upErr } = await supabase.storage.from("audios").upload(nome, audio, {
      contentType: audio.type || "audio/mpeg",
      upsert: false,
    });
    if (upErr) return { erro: "Falha ao enviar o áudio." };
    audio_path = nome;
  }

  const insert: Record<string, unknown> = { titulo, texto, data, status };
  if (audio_path) insert.audio_path = audio_path;

  const { data: row, error } = await supabase
    .from("daily_thoughts")
    .insert(insert)
    .select("id")
    .single();
  if (error) return { erro: "Não foi possível salvar." };

  await registrarAcao("publish_thought", { entidade: "daily_thoughts", entidadeId: row.id, detalhe: { status, data } });
  revalidatePath("/admin/pensamento");
  revalidatePath("/app");
  return { ok: true };
}

export async function excluirPensamento(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("daily_thoughts").delete().eq("id", id);
  await registrarAcao("delete_thought", { entidade: "daily_thoughts", entidadeId: id });
  revalidatePath("/admin/pensamento");
  revalidatePath("/app");
}
```

- [ ] **Step 2: Criar o formulário (client)**

`src/components/admin/PensamentoForm.tsx`:

```tsx
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
```

- [ ] **Step 3: Criar a página de listagem**

`src/app/(admin)/admin/pensamento/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import PensamentoForm from "@/components/admin/PensamentoForm";
import { excluirPensamento } from "./actions";
import { pensamentoVisivel } from "@/lib/admin/pensamento";

export const metadata = { title: "Pensamento diário — Admin" };

export default async function PensamentoAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_thoughts")
    .select("id, titulo, data, status, audio_path")
    .order("data", { ascending: false });
  const hoje = new Date().toISOString().slice(0, 10);
  const itens = data ?? [];

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <PensamentoForm />
      <div>
        <h1 className="text-2xl text-ink">Pensamentos</h1>
        <ul className="mt-4 divide-y divide-line rounded-[10px] border border-line bg-surface">
          {itens.map((p) => {
            const visivel = pensamentoVisivel(p, hoje);
            const rotulo = p.status === "rascunho" ? "Rascunho" : visivel ? "Publicado" : "Agendado";
            return (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{p.titulo}</p>
                  <p className="text-xs text-ink-2">{p.data} · {rotulo}{p.audio_path ? " · com áudio" : ""}</p>
                </div>
                <form action={excluirPensamento}>
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" className="text-xs text-red-600 hover:underline">Excluir</button>
                </form>
              </li>
            );
          })}
          {itens.length === 0 && <li className="px-4 py-6 text-sm text-ink-2">Nenhum pensamento ainda.</li>}
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Aplicar o filtro de visibilidade na área do cliente**

Em `src/app/app/page.tsx`, a query do Pensamento diário deve filtrar por status e data. Localizar a consulta a `daily_thoughts` e ajustá-la para:

```ts
const hoje = new Date().toISOString().slice(0, 10);
const { data: pensamentos } = await supabase
  .from("daily_thoughts")
  .select("*")
  .eq("status", "publicado")
  .lte("data", hoje)
  .order("data", { ascending: false });
```

- [ ] **Step 5: Verificar**

Run: `npx vitest run` (todos verdes) e `npx tsc --noEmit`.
Manual: criar um pensamento com data futura como "publicado" → aparece como "Agendado" no admin e **não** aparece em `/app`; criar com data de hoje → aparece nos dois.

- [ ] **Step 6: Commit**

```bash
git add "platform/src/app/(admin)/admin/pensamento" platform/src/components/admin/PensamentoForm.tsx platform/src/app/app/page.tsx
git commit -m "feat(admin): CRUD do Pensamento diário com upload e agendamento; cliente filtra por visibilidade"
```

---

## Task 8: Moderação — montagem da fila (TDD)

**Files:**
- Create: `src/lib/admin/moderacao.ts`
- Test: `src/lib/admin/moderacao.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

`src/lib/admin/moderacao.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { montarFilaModeracao } from "./moderacao";

describe("montarFilaModeracao", () => {
  it("conta pendentes por aba", () => {
    const fila = montarFilaModeracao({
      posts: [{ id: "1", status: "pendente" }, { id: "2", status: "aprovado" }],
      depoimentos: [{ id: "d1", status: "pendente" }],
      sugestoes: [{ id: "s1", status: "pendente" }, { id: "s2", status: "pendente" }],
    });
    expect(fila.posts).toBe(1);
    expect(fila.depoimentos).toBe(1);
    expect(fila.sugestoes).toBe(2);
    expect(fila.total).toBe(4);
  });
  it("zera com listas vazias", () => {
    const fila = montarFilaModeracao({ posts: [], depoimentos: [], sugestoes: [] });
    expect(fila.total).toBe(0);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/lib/admin/moderacao.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implementar**

`src/lib/admin/moderacao.ts`:

```ts
type ComStatus = { id: string; status: string };

export function montarFilaModeracao(input: {
  posts: ComStatus[];
  depoimentos: ComStatus[];
  sugestoes: ComStatus[];
}) {
  const pend = (arr: ComStatus[]) => arr.filter((x) => x.status === "pendente").length;
  const posts = pend(input.posts);
  const depoimentos = pend(input.depoimentos);
  const sugestoes = pend(input.sugestoes);
  return { posts, depoimentos, sugestoes, total: posts + depoimentos + sugestoes };
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/lib/admin/moderacao.test.ts`
Expected: PASS (2 testes).

- [ ] **Step 5: Commit**

```bash
git add platform/src/lib/admin/moderacao.ts platform/src/lib/admin/moderacao.test.ts
git commit -m "feat(admin): lógica de contagem da fila de moderação com testes"
```

---

## Task 9: Moderação — página e ações

**Files:**
- Create: `src/app/(admin)/admin/moderacao/actions.ts`
- Create: `src/app/(admin)/admin/moderacao/page.tsx`

- [ ] **Step 1: Criar as Server Actions**

`src/app/(admin)/admin/moderacao/actions.ts`:

```ts
"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { registrarAcao } from "@/lib/admin/audit";

async function setStatus(
  tabela: "community_posts" | "testimonials" | "suggestions",
  id: string,
  status: string,
  acao: string,
) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from(tabela).update({ status }).eq("id", id);
  await registrarAcao(acao, { entidade: tabela, entidadeId: id, detalhe: { status } });
  revalidatePath("/admin/moderacao");
}

export async function moderarPost(formData: FormData) {
  await setStatus("community_posts", String(formData.get("id")), String(formData.get("status")), "moderate_post");
  revalidatePath("/app/comunidade");
}
export async function moderarDepoimento(formData: FormData) {
  await setStatus("testimonials", String(formData.get("id")), String(formData.get("status")), "moderate_testimonial");
}
export async function moderarSugestao(formData: FormData) {
  await setStatus("suggestions", String(formData.get("id")), String(formData.get("status")), "moderate_suggestion");
}
```

- [ ] **Step 2: Criar a página**

`src/app/(admin)/admin/moderacao/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import { montarFilaModeracao } from "@/lib/admin/moderacao";
import { moderarPost, moderarDepoimento, moderarSugestao } from "./actions";

export const metadata = { title: "Moderação — Admin" };

function BotaoStatus({ action, id, status, children }: { action: (fd: FormData) => void; id: string; status: string; children: React.ReactNode }) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className="rounded-full border border-line px-3 py-1 text-xs text-ink transition hover:bg-tan-bg">{children}</button>
    </form>
  );
}

export default async function ModeracaoAdmin() {
  const supabase = await createClient();
  const [posts, depos, sugs] = await Promise.all([
    supabase.from("community_posts").select("id, texto, status, author_id").eq("status", "pendente").order("created_at", { ascending: true }),
    supabase.from("testimonials").select("id, nome, texto, status").eq("status", "pendente").order("id", { ascending: true }),
    supabase.from("suggestions").select("id, texto, status").eq("status", "pendente").order("created_at", { ascending: true }),
  ]);
  const fila = montarFilaModeracao({
    posts: (posts.data ?? []).map((p) => ({ id: p.id, status: p.status })),
    depoimentos: (depos.data ?? []).map((d) => ({ id: d.id, status: d.status ?? "pendente" })),
    sugestoes: (sugs.data ?? []).map((s) => ({ id: s.id, status: s.status ?? "pendente" })),
  });

  return (
    <div>
      <h1 className="text-2xl text-ink">Moderação <span className="text-base text-ink-2">({fila.total} pendentes)</span></h1>

      <section className="mt-6">
        <h2 className="font-semibold text-ink">Comunidade ({fila.posts})</h2>
        <ul className="mt-3 space-y-3">
          {(posts.data ?? []).map((p) => (
            <li key={p.id} className="rounded-[10px] border border-line bg-surface p-4">
              <p className="text-sm text-ink">{p.texto}</p>
              <div className="mt-3 flex gap-2">
                <BotaoStatus action={moderarPost} id={p.id} status="aprovado">Aprovar</BotaoStatus>
                <BotaoStatus action={moderarPost} id={p.id} status="recusado">Recusar</BotaoStatus>
              </div>
            </li>
          ))}
          {fila.posts === 0 && <li className="text-sm text-ink-2">Nada pendente.</li>}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-ink">Depoimentos ({fila.depoimentos})</h2>
        <ul className="mt-3 space-y-3">
          {(depos.data ?? []).map((d) => (
            <li key={d.id} className="rounded-[10px] border border-line bg-surface p-4">
              <p className="text-sm text-ink">{d.texto}</p>
              <p className="text-xs text-ink-2">— {d.nome ?? "anônimo"}</p>
              <div className="mt-3 flex gap-2">
                <BotaoStatus action={moderarDepoimento} id={d.id} status="aprovado">Aprovar</BotaoStatus>
                <BotaoStatus action={moderarDepoimento} id={d.id} status="recusado">Recusar</BotaoStatus>
              </div>
            </li>
          ))}
          {fila.depoimentos === 0 && <li className="text-sm text-ink-2">Nada pendente.</li>}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-ink">Sugestões ({fila.sugestoes})</h2>
        <ul className="mt-3 space-y-3">
          {(sugs.data ?? []).map((s) => (
            <li key={s.id} className="rounded-[10px] border border-line bg-surface p-4">
              <p className="text-sm text-ink">{s.texto}</p>
              <div className="mt-3 flex gap-2">
                <BotaoStatus action={moderarSugestao} id={s.id} status="lida">Marcar como lida</BotaoStatus>
                <BotaoStatus action={moderarSugestao} id={s.id} status="arquivada">Arquivar</BotaoStatus>
              </div>
            </li>
          ))}
          {fila.sugestoes === 0 && <li className="text-sm text-ink-2">Nada pendente.</li>}
        </ul>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit`. Manual: com um post `pendente` no banco, aprovar → some da fila e aparece em `/app/comunidade`.

- [ ] **Step 4: Commit**

```bash
git add "platform/src/app/(admin)/admin/moderacao"
git commit -m "feat(admin): moderação unificada (comunidade, depoimentos, sugestões) com auditoria"
```

---

## Task 10: Acessos — conceder/remover produto + venda manual

**Files:**
- Create: `src/app/(admin)/admin/acessos/actions.ts`
- Create: `src/components/admin/AcessoForm.tsx`
- Create: `src/app/(admin)/admin/acessos/page.tsx`

- [ ] **Step 1: Criar as Server Actions**

`src/app/(admin)/admin/acessos/actions.ts`:

```ts
"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { registrarAcao } from "@/lib/admin/audit";

export type AcessoState = { ok?: boolean; erro?: string } | null;

export async function concederAcesso(
  _prev: AcessoState,
  formData: FormData,
): Promise<AcessoState> {
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const productId = String(formData.get("product_id") ?? "");
  const registrarVenda = formData.get("registrar_venda") === "on";
  const valor = Number(formData.get("valor") ?? 0);
  if (!email || !productId) return { erro: "Informe e-mail e produto." };

  const supabase = await createClient();

  // profiles não guarda e-mail; localizar user_id pelo e-mail exige service role.
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  const { data: list } = await admin.auth.admin.listUsers();
  const alvo = list?.users.find((u) => u.email?.toLowerCase() === email);
  if (!alvo) return { erro: "Nenhum usuário com esse e-mail." };

  const { error } = await supabase.from("user_products").insert({
    user_id: alvo.id,
    product_id: productId,
    origem: "admin",
    status: "ativo",
  });
  if (error) return { erro: "Não foi possível conceder (talvez já tenha o produto)." };

  if (registrarVenda) {
    await supabase.from("sales").insert({ user_id: alvo.id, product_id: productId, valor });
  }
  await registrarAcao("grant_product", { entidade: "user_products", entidadeId: alvo.id, detalhe: { productId, registrarVenda, valor } });
  revalidatePath("/admin/acessos");
  return { ok: true };
}

export async function removerAcesso(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("user_products").update({ status: "cancelado" }).eq("id", id);
  await registrarAcao("revoke_product", { entidade: "user_products", entidadeId: id });
  revalidatePath("/admin/acessos");
}
```

> Nota: `concederAcesso` usa o service-role client (`listUsers`) para resolver o e-mail → `user_id`, pois `profiles` não guarda e-mail. Requer `SUPABASE_SERVICE_ROLE_KEY`.

- [ ] **Step 2: Criar o formulário**

`src/components/admin/AcessoForm.tsx`:

```tsx
"use client";
import { useActionState } from "react";
import { concederAcesso, type AcessoState } from "@/app/(admin)/admin/acessos/actions";

export default function AcessoForm({ produtos }: { produtos: { id: string; nome: string }[] }) {
  const [state, action, pending] = useActionState<AcessoState, FormData>(concederAcesso, null);
  return (
    <form action={action} className="rounded-[10px] border border-line bg-surface p-6">
      <h2 className="font-semibold text-ink">Conceder acesso</h2>
      <div className="mt-4 grid gap-3">
        <input name="email" type="email" placeholder="E-mail do cliente" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        <select name="product_id" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink">
          <option value="">Selecione o produto</option>
          {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-ink-2">
          <input type="checkbox" name="registrar_venda" /> Registrar venda
        </label>
        <input name="valor" type="number" step="0.01" placeholder="Valor (R$)" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      </div>
      {state?.erro && <p className="mt-3 text-sm text-red-600">{state.erro}</p>}
      {state?.ok && <p className="mt-3 text-sm text-green-700">Acesso concedido!</p>}
      <button type="submit" disabled={pending} className="mt-4 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60">
        {pending ? "Concedendo…" : "Conceder"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Criar a página**

`src/app/(admin)/admin/acessos/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import AcessoForm from "@/components/admin/AcessoForm";
import { removerAcesso } from "./actions";

export const metadata = { title: "Acessos — Admin" };

export default async function AcessosAdmin() {
  const supabase = await createClient();
  const [{ data: produtos }, { data: acessos }] = await Promise.all([
    supabase.from("products").select("id, nome").eq("ativo", true).order("nome"),
    supabase.from("user_products").select("id, status, origem, products(nome)").eq("status", "ativo").order("created_at", { ascending: false }).limit(100),
  ]);

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <AcessoForm produtos={produtos ?? []} />
      <div>
        <h1 className="text-2xl text-ink">Acessos ativos</h1>
        <ul className="mt-4 divide-y divide-line rounded-[10px] border border-line bg-surface">
          {(acessos ?? []).map((a) => (
            <li key={a.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-ink">{(a.products as { nome: string } | null)?.nome ?? "—"} <span className="text-xs text-ink-2">· {a.origem}</span></span>
              <form action={removerAcesso}>
                <input type="hidden" name="id" value={a.id} />
                <button type="submit" className="text-xs text-red-600 hover:underline">Remover</button>
              </form>
            </li>
          ))}
          {(acessos ?? []).length === 0 && <li className="px-4 py-6 text-sm text-ink-2">Nenhum acesso ativo.</li>}
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit`. Manual (requer service-role key): conceder Cartografia a um e-mail existente → aparece na lista; o usuário passa a ver o produto em `/app`.

- [ ] **Step 5: Commit**

```bash
git add "platform/src/app/(admin)/admin/acessos" platform/src/components/admin/AcessoForm.tsx
git commit -m "feat(admin): concessão/remoção de acesso a produtos + venda manual, com auditoria"
```

---

## Task 11: Convites — validação (TDD)

**Files:**
- Create: `src/lib/admin/convite.ts`
- Test: `src/lib/admin/convite.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

`src/lib/admin/convite.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { validarConvite, gerarToken } from "./convite";

const agora = new Date("2026-09-15T12:00:00Z");

describe("validarConvite", () => {
  it("aceita convite pendente não expirado", () => {
    expect(validarConvite({ status: "pendente", expira_em: "2026-09-20T00:00:00Z" }, agora)).toEqual({ ok: true });
  });
  it("recusa convite já usado", () => {
    expect(validarConvite({ status: "usado", expira_em: null }, agora)).toEqual({ ok: false, motivo: "usado" });
  });
  it("recusa convite expirado", () => {
    expect(validarConvite({ status: "pendente", expira_em: "2026-09-10T00:00:00Z" }, agora)).toEqual({ ok: false, motivo: "expirado" });
  });
});

describe("gerarToken", () => {
  it("gera token com pelo menos 20 caracteres", () => {
    expect(gerarToken().length).toBeGreaterThanOrEqual(20);
  });
  it("gera tokens diferentes", () => {
    expect(gerarToken()).not.toBe(gerarToken());
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/lib/admin/convite.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implementar**

`src/lib/admin/convite.ts`:

```ts
export type ResultadoConvite = { ok: true } | { ok: false; motivo: "usado" | "expirado" };

export function validarConvite(
  c: { status: string; expira_em: string | null },
  agora: Date,
): ResultadoConvite {
  if (c.status !== "pendente") return { ok: false, motivo: "usado" };
  if (c.expira_em && new Date(c.expira_em) < agora) return { ok: false, motivo: "expirado" };
  return { ok: true };
}

export function gerarToken(): string {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").slice(0, 8);
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/lib/admin/convite.test.ts`
Expected: PASS (5 testes).

- [ ] **Step 5: Commit**

```bash
git add platform/src/lib/admin/convite.ts platform/src/lib/admin/convite.test.ts
git commit -m "feat(admin): validação e geração de token de convite com testes"
```

---

## Task 12: Convites — criar (admin) e resgatar (cliente)

**Files:**
- Create: `src/app/(admin)/admin/convites/actions.ts`
- Create: `src/components/admin/ConviteForm.tsx`
- Create: `src/app/(admin)/admin/convites/page.tsx`
- Create: `src/app/convite/[token]/page.tsx`
- Create: `src/app/convite/[token]/actions.ts`

- [ ] **Step 1: Criar as actions do admin (criar convite)**

`src/app/(admin)/admin/convites/actions.ts`:

```ts
"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { registrarAcao } from "@/lib/admin/audit";
import { gerarToken } from "@/lib/admin/convite";

export type ConviteState = { ok?: boolean; erro?: string; token?: string } | null;

export async function criarConvite(
  _prev: ConviteState,
  formData: FormData,
): Promise<ConviteState> {
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const productId = String(formData.get("product_id") ?? "") || null;
  if (!email) return { erro: "Informe o e-mail." };

  const supabase = await createClient();
  const token = gerarToken();
  const expira = new Date();
  expira.setDate(expira.getDate() + 14);

  const { data, error } = await supabase.from("invites").insert({
    email, product_id: productId, token, status: "pendente", expira_em: expira.toISOString(),
  }).select("id").single();
  if (error) return { erro: "Não foi possível criar o convite." };

  await registrarAcao("create_invite", { entidade: "invites", entidadeId: data.id, detalhe: { email, productId } });
  revalidatePath("/admin/convites");
  return { ok: true, token };
}
```

- [ ] **Step 2: Criar o formulário de convite**

`src/components/admin/ConviteForm.tsx`:

```tsx
"use client";
import { useActionState } from "react";
import { criarConvite, type ConviteState } from "@/app/(admin)/admin/convites/actions";

export default function ConviteForm({ produtos, siteUrl }: { produtos: { id: string; nome: string }[]; siteUrl: string }) {
  const [state, action, pending] = useActionState<ConviteState, FormData>(criarConvite, null);
  return (
    <form action={action} className="rounded-[10px] border border-line bg-surface p-6">
      <h2 className="font-semibold text-ink">Novo convite</h2>
      <div className="mt-4 grid gap-3">
        <input name="email" type="email" placeholder="E-mail do convidado" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        <select name="product_id" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink">
          <option value="">Sem produto (só acesso)</option>
          {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
      </div>
      {state?.erro && <p className="mt-3 text-sm text-red-600">{state.erro}</p>}
      {state?.ok && state.token && (
        <p className="mt-3 break-all text-sm text-green-700">Link: {siteUrl}/convite/{state.token}</p>
      )}
      <button type="submit" disabled={pending} className="mt-4 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60">
        {pending ? "Criando…" : "Criar convite"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Criar a página de convites (admin)**

`src/app/(admin)/admin/convites/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import ConviteForm from "@/components/admin/ConviteForm";

export const metadata = { title: "Convites — Admin" };

export default async function ConvitesAdmin() {
  const supabase = await createClient();
  const [{ data: produtos }, { data: convites }] = await Promise.all([
    supabase.from("products").select("id, nome").eq("ativo", true).order("nome"),
    supabase.from("invites").select("id, email, status, expira_em, created_at").order("created_at", { ascending: false }).limit(100),
  ]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <ConviteForm produtos={produtos ?? []} siteUrl={siteUrl} />
      <div>
        <h1 className="text-2xl text-ink">Convites</h1>
        <ul className="mt-4 divide-y divide-line rounded-[10px] border border-line bg-surface">
          {(convites ?? []).map((c) => (
            <li key={c.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-ink">{c.email}</span>
              <span className="text-xs text-ink-2">{c.status}</span>
            </li>
          ))}
          {(convites ?? []).length === 0 && <li className="px-4 py-6 text-sm text-ink-2">Nenhum convite ainda.</li>}
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Criar a action de resgate (cliente)**

`src/app/convite/[token]/actions.ts`:

```ts
"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validarConvite } from "@/lib/admin/convite";

export type ResgateState = { erro?: string } | null;

export async function resgatarConvite(
  _prev: ResgateState,
  formData: FormData,
): Promise<ResgateState> {
  const token = String(formData.get("token") ?? "");
  const senha = String(formData.get("senha") ?? "");
  if (senha.length < 8) return { erro: "A senha deve ter ao menos 8 caracteres." };

  const admin = createAdminClient();
  const { data: convite } = await admin
    .from("invites")
    .select("id, email, product_id, status, expira_em")
    .eq("token", token)
    .maybeSingle();
  if (!convite) return { erro: "Convite inválido." };

  const check = validarConvite(convite, new Date());
  if (!check.ok) return { erro: check.motivo === "usado" ? "Convite já utilizado." : "Convite expirado." };

  // cria (ou confirma) o usuário
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email: convite.email,
    password: senha,
    email_confirm: true,
  });
  if (cErr || !created.user) return { erro: "Não foi possível criar a conta." };

  if (convite.product_id) {
    await admin.from("user_products").insert({
      user_id: created.user.id,
      product_id: convite.product_id,
      origem: "convite",
      status: "ativo",
    });
  }
  await admin.from("invites").update({ status: "usado" }).eq("id", convite.id);

  // loga o cliente
  const supabase = await createClient();
  await supabase.auth.signInWithPassword({ email: convite.email, password: senha });
  redirect("/app");
}
```

- [ ] **Step 5: Criar a página de resgate (substitui o placeholder existente em `/convite`)**

`src/app/convite/[token]/page.tsx`:

```tsx
"use client";
import { use } from "react";
import { useActionState } from "react";
import { resgatarConvite, type ResgateState } from "./actions";

export default function ResgatePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [state, action, pending] = useActionState<ResgateState, FormData>(resgatarConvite, null);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-3xl text-ink">Ativar seu acesso</h1>
      <p className="mt-2 text-ink-2">Defina sua senha para entrar na plataforma.</p>
      <form action={action} className="mt-6 grid gap-3">
        <input type="hidden" name="token" value={token} />
        <input name="senha" type="password" placeholder="Crie uma senha (mín. 8 caracteres)" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        {state?.erro && <p className="text-sm text-red-600">{state.erro}</p>}
        <button type="submit" disabled={pending} className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60">
          {pending ? "Ativando…" : "Ativar acesso"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 6: Verificar**

Run: `npx vitest run` (tudo verde) e `npx tsc --noEmit`.
Manual (requer service-role key): criar convite no admin → abrir o link em aba anônima → definir senha → cair em `/app` com o produto liberado. Sem a key, a criação de convite funciona, mas o resgate retorna erro de ambiente (esperado até a key ser adicionada).

- [ ] **Step 7: Commit**

```bash
git add "platform/src/app/(admin)/admin/convites" platform/src/components/admin/ConviteForm.tsx "platform/src/app/convite"
git commit -m "feat(admin): criar convite (admin) e resgatar convite por link (cria conta + concede produto)"
```

---

## Task 13: Auditoria — tela de listagem

**Files:**
- Create: `src/app/(admin)/admin/auditoria/page.tsx`

- [ ] **Step 1: Criar a página**

`src/app/(admin)/admin/auditoria/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Auditoria — Admin" };

export default async function AuditoriaAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_log")
    .select("id, acao, entidade, entidade_id, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="text-2xl text-ink">Auditoria</h1>
      <div className="mt-4 overflow-x-auto rounded-[10px] border border-line bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-ink-2">
            <tr><th className="px-4 py-2">Quando</th><th className="px-4 py-2">Ação</th><th className="px-4 py-2">Entidade</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(data ?? []).map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2 text-ink-2">{new Date(r.created_at).toLocaleString("pt-BR")}</td>
                <td className="px-4 py-2 text-ink">{r.acao}</td>
                <td className="px-4 py-2 text-ink-2">{r.entidade}{r.entidade_id ? ` · ${r.entidade_id.slice(0, 8)}` : ""}</td>
              </tr>
            ))}
            {(data ?? []).length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-ink-2">Sem registros ainda.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar**

Run: `npx tsc --noEmit`. Manual: após aprovar um post/criar convite, a ação aparece na tabela.

- [ ] **Step 3: Commit**

```bash
git add "platform/src/app/(admin)/admin/auditoria"
git commit -m "feat(admin): tela de auditoria (listagem do audit_log)"
```

---

## Task 14: Fechamento — testes, build e limpeza

**Files:**
- (nenhum novo)

- [ ] **Step 1: Rodar toda a bateria de testes**

Run: `npx vitest run`
Expected: todos os testes verdes (roles, pensamento, moderacao, convite + os pré-existentes).

- [ ] **Step 2: Type-check e build de produção**

Run: `npx tsc --noEmit` e depois `npm run build`
Expected: sem erros. Se o validador reclamar de rota, `rm -rf .next` e rebuildar.

- [ ] **Step 3: Remover o placeholder antigo de `/convite` se conflitar**

O placeholder `src/app/convite/page.tsx` (raiz) pode coexistir com `/convite/[token]`. Se `next build` acusar conflito, manter apenas `[token]`; caso contrário, deixar o `page.tsx` da raiz como página informativa. Verificar o resultado do build e agir conforme.

- [ ] **Step 4: Commit final (se houver ajustes)**

```bash
git add -A
git commit -m "chore(admin): ajustes finais e verificação da Onda 1 do backoffice"
```

---

## Self-review (cobertura da spec)

- Base `/admin` protegida por papel → Task 2, 4. ✅
- Dashboard → Task 5. ✅
- Pensamento diário (upload + agendar) → Task 6, 7. ✅
- Moderação unificada (comunidade/depoimentos/sugestões) → Task 8, 9. ✅
- Acesso a produtos + venda manual → Task 10 (+ tabela `sales` na Task 1). ✅
- Convites (criar + resgatar) → Task 11, 12. ✅
- Auditoria (LGPD) → Task 1 (tabela), Task 3 (helper), Task 13 (tela); gravação em todas as actions. ✅
- Papéis extensíveis → Task 1 (`has_role`), Task 2 (`roles.ts`). ✅

## Pré-requisitos que bloqueiam parte da Onda 1

- `SUPABASE_SERVICE_ROLE_KEY` em `platform/.env.local`: necessário para **Acessos** (resolver e-mail→user_id) e **resgate de Convite** (criar conta). Todo o restante (dashboard, pensamento, moderação, auditoria) funciona sem ela. Adicionar a key destrava essas duas partes sem mudança de código.

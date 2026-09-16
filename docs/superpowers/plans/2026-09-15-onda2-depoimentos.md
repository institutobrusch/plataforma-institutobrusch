# Onda 2 — Depoimentos (admin + público) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** O admin cria/edita/exclui depoimentos de 4 tipos (texto/imagem/áudio/vídeo); o site público (`/depoimentos` e destaques da home) passa a ler do Supabase (`status='aprovado'`) e renderiza cada tipo.

**Architecture:** Página admin `/admin/depoimentos` (lista + form) com Server Actions após `requireAdmin()` e auditoria; mídia no bucket público `capas`, vídeo por link YouTube. `TestimonialCard` reescrito para 4 tipos. Migração só de RLS (leitura pública restrita a aprovados). Helper puro `youtubeId`.

**Tech Stack:** Next.js 16 (App Router, RSC, Server Actions), React 19 (`useActionState`), TypeScript, Tailwind v4, Supabase (Postgres/Storage), Vitest.

**Referência da spec:** `docs/superpowers/specs/2026-09-15-onda2-depoimentos-design.md`

---

## Convenções

- Comandos em `platform/`. Windows: Bash tool (heredoc) ou PowerShell.
- Commits no repo root, terminando com `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. **Não** dar push (o controlador faz).
- `requireAdmin` de `@/lib/auth`; `registrarAcao` de `@/lib/admin/audit`; `createClient` de `@/lib/supabase/server`; `slugify`/`montarNomeArquivo` já existem em `@/lib/admin/*`.
- Pastas com parênteses (`(admin)`, `(site)`) → aspas no git.
- Tokens: line, surface, bg, ink, ink-2, ink-3, navy, navy-d, tan.

## Estrutura de arquivos

- Migração `11_testimonials_public_aprovado`.
- Criar `src/lib/youtube.ts` + `src/lib/youtube.test.ts`.
- Modificar `src/components/admin/AdminShell.tsx` (menu).
- Admin: `src/app/(admin)/admin/depoimentos/{actions.ts,page.tsx}` + `src/components/admin/DepoimentoForm.tsx`.
- Reescrever `src/components/TestimonialCard.tsx`.
- Modificar `src/app/(site)/depoimentos/page.tsx` e `src/app/(site)/page.tsx`.

---

## Task 1: Migração de RLS (leitura pública só de aprovados)

**Files:** Supabase migration `11_testimonials_public_aprovado`.

- [ ] **Step 1: Aplicar** (MCP `apply_migration`, project `jnwjrjzinqqcxlvleznq`, name `11_testimonials_public_aprovado`):
```sql
drop policy if exists "depo pub" on public.testimonials;
create policy "depo pub" on public.testimonials
  for select using (status = 'aprovado' or public.is_admin());
```

- [ ] **Step 2: Verificar** (MCP `execute_sql`):
```sql
select policyname, qual from pg_policies
where schemaname='public' and tablename='testimonials' and cmd='SELECT';
```
Expected: `depo pub` com `qual` contendo `status = 'aprovado'`. (Não altera tipos; não regenerar.)

- [ ] **Step 3: Commit** (nada de código mudou; registrar via `--allow-empty`)
```
git commit --allow-empty -m "feat(db): leitura pública de testimonials restrita a aprovados (RLS)"
```

---

## Task 2: Helper youtubeId (TDD) + menu do admin

**Files:** Create `src/lib/youtube.ts`, `src/lib/youtube.test.ts`; Modify `src/components/admin/AdminShell.tsx`.

- [ ] **Step 1: Teste que falha** — `src/lib/youtube.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { youtubeId } from "./youtube";

describe("youtubeId", () => {
  it("extrai de watch?v=", () => {
    expect(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("extrai de youtu.be", () => {
    expect(youtubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("extrai de embed", () => {
    expect(youtubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("aceita id puro", () => {
    expect(youtubeId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("retorna null para vazio/lixo", () => {
    expect(youtubeId("")).toBeNull();
    expect(youtubeId("https://exemplo.com/x")).toBeNull();
    expect(youtubeId(null)).toBeNull();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar** — `npx vitest run src/lib/youtube.test.ts`.

- [ ] **Step 3: Implementar** — `src/lib/youtube.ts`:
```ts
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/watch\?(?:.*&)?v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  if (/^[\w-]{11}$/.test(url.trim())) return url.trim();
  return null;
}
```

- [ ] **Step 4: Rodar e ver passar** — `npx vitest run src/lib/youtube.test.ts` (5 testes).

- [ ] **Step 5: Menu** — em `src/components/admin/AdminShell.tsx`, no array `MENU`, adicionar o item de Depoimentos logo após a linha de E-books:
```tsx
  { href: "/admin/ebooks", label: "E-books" },
  { href: "/admin/depoimentos", label: "Depoimentos" },
```
(Ler o arquivo e inserir só essa linha; manter o resto.)

- [ ] **Step 6: Verificar** — `npx tsc --noEmit` passa; `npx vitest run` verde.

- [ ] **Step 7: Commit**
```
git add platform/src/lib/youtube.ts platform/src/lib/youtube.test.ts platform/src/components/admin/AdminShell.tsx
git commit -m "feat(admin): helper youtubeId (TDD) + item Depoimentos no menu do admin"
```

---

## Task 3: Admin — CRUD de depoimentos

**Files:** Create `src/app/(admin)/admin/depoimentos/actions.ts`, `.../depoimentos/page.tsx`, `src/components/admin/DepoimentoForm.tsx`.

- [ ] **Step 1: Actions** — `src/app/(admin)/admin/depoimentos/actions.ts`:
```ts
"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { registrarAcao } from "@/lib/admin/audit";
import { montarNomeArquivo } from "@/lib/admin/carto";

export type DepoimentoState = { ok?: boolean; erro?: string } | null;

export async function salvarDepoimento(_prev: DepoimentoState, formData: FormData): Promise<DepoimentoState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const nome = String(formData.get("nome") ?? "").trim() || null;
  const iniciais = String(formData.get("iniciais") ?? "").trim() || null;
  const contexto = String(formData.get("contexto") ?? "").trim() || null;
  const tipo = String(formData.get("tipo") ?? "texto").trim();
  const texto = String(formData.get("texto") ?? "").trim() || null;
  const video_url = String(formData.get("video_url") ?? "").trim() || null;
  const ordem = Number(formData.get("ordem") ?? 0) || 0;
  const status = String(formData.get("status") ?? "aprovado").trim();
  const midia = formData.get("midia") as File | null;
  if (!["texto", "imagem", "audio", "video"].includes(tipo)) return { erro: "Tipo inválido." };
  if (!nome) return { erro: "Informe o nome." };

  const supabase = await createClient();
  let media_path: string | undefined;
  if (midia && midia.size > 0) {
    const nomeArq = montarNomeArquivo(midia.name, "depoimentos");
    const { error: upErr } = await supabase.storage.from("capas").upload(nomeArq, midia, {
      contentType: midia.type || "application/octet-stream", upsert: false,
    });
    if (upErr) return { erro: "Falha ao enviar a mídia." };
    media_path = nomeArq;
  }

  const base = { nome, iniciais, contexto, tipo, texto, video_url, ordem, status };
  if (id) {
    const patch: typeof base & { media_path?: string } = { ...base };
    if (media_path) patch.media_path = media_path;
    const { error } = await supabase.from("testimonials").update(patch).eq("id", id);
    if (error) return { erro: "Não foi possível salvar." };
    await registrarAcao("update_testimonial", { entidade: "testimonials", entidadeId: id });
  } else {
    const { data: row, error } = await supabase.from("testimonials")
      .insert({ ...base, media_path: media_path ?? null }).select("id").single();
    if (error) return { erro: "Não foi possível criar." };
    await registrarAcao("create_testimonial", { entidade: "testimonials", entidadeId: row.id });
  }
  revalidatePath("/admin/depoimentos");
  revalidatePath("/depoimentos");
  revalidatePath("/");
  return { ok: true };
}

export async function excluirDepoimento(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const { data: d } = await supabase.from("testimonials").select("media_path").eq("id", id).maybeSingle();
  if (d?.media_path) await supabase.storage.from("capas").remove([d.media_path]);
  await supabase.from("testimonials").delete().eq("id", id);
  await registrarAcao("delete_testimonial", { entidade: "testimonials", entidadeId: id });
  revalidatePath("/admin/depoimentos");
  revalidatePath("/depoimentos");
  revalidatePath("/");
}
```
Nota: se `.update(patch)`/`.insert` reclamar de tipos, use objeto tipado explícito (mesmos campos) — mantenha o comportamento.

- [ ] **Step 2: DepoimentoForm** — `src/components/admin/DepoimentoForm.tsx`:
```tsx
"use client";
import { useActionState } from "react";
import { salvarDepoimento, type DepoimentoState } from "@/app/(admin)/admin/depoimentos/actions";

type Depo = { id: string; nome: string | null; iniciais: string | null; contexto: string | null; tipo: string; texto: string | null; video_url: string | null; ordem: number | null; status: string };

export default function DepoimentoForm({ depo }: { depo?: Depo }) {
  const [state, action, pending] = useActionState<DepoimentoState, FormData>(salvarDepoimento, null);
  return (
    <form action={action} className="grid gap-3">
      {depo && <input type="hidden" name="id" value={depo.id} />}
      <div className="flex flex-wrap gap-2">
        <input name="nome" defaultValue={depo?.nome ?? ""} placeholder="Nome" className="flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        <input name="iniciais" defaultValue={depo?.iniciais ?? ""} placeholder="Iniciais" className="w-24 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      </div>
      <input name="contexto" defaultValue={depo?.contexto ?? ""} placeholder="Contexto (ex.: participante d'O Círculo)" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <div className="flex flex-wrap gap-2">
        <select name="tipo" defaultValue={depo?.tipo ?? "texto"} className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink">
          <option value="texto">Texto</option>
          <option value="imagem">Imagem</option>
          <option value="audio">Áudio</option>
          <option value="video">Vídeo (YouTube)</option>
        </select>
        <select name="status" defaultValue={depo?.status ?? "aprovado"} className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink">
          <option value="aprovado">Aprovado</option>
          <option value="pendente">Pendente</option>
          <option value="recusado">Recusado</option>
        </select>
        <input name="ordem" type="number" defaultValue={depo?.ordem ?? 0} className="w-24 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      </div>
      <textarea name="texto" defaultValue={depo?.texto ?? ""} rows={3} placeholder="Texto do depoimento (ou legenda da mídia)" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <input name="video_url" defaultValue={depo?.video_url ?? ""} placeholder="URL do YouTube (para tipo vídeo)" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <label className="text-sm text-ink-2">Mídia (imagem ou áudio) {depo ? "(enviar substitui)" : ""}
        <input type="file" name="midia" accept="image/*,audio/*" className="mt-1 block w-full text-sm text-ink" />
      </label>
      {state?.erro && <p className="text-sm text-red-600">{state.erro}</p>}
      {state?.ok && <p className="text-sm text-green-700">Salvo!</p>}
      <button type="submit" disabled={pending} className="justify-self-start rounded-full bg-navy px-5 py-2 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60">
        {pending ? "Salvando…" : depo ? "Atualizar depoimento" : "Criar depoimento"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Página** — `src/app/(admin)/admin/depoimentos/page.tsx`:
```tsx
import { createClient } from "@/lib/supabase/server";
import DepoimentoForm from "@/components/admin/DepoimentoForm";
import { excluirDepoimento } from "./actions";

export const metadata = { title: "Depoimentos — Admin" };

export default async function DepoimentosAdmin() {
  const supabase = await createClient();
  const { data: depos } = await supabase
    .from("testimonials")
    .select("id, nome, iniciais, contexto, tipo, texto, video_url, ordem, status")
    .order("ordem", { ascending: true });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl text-ink">Depoimentos</h1>
      <section className="mt-6 rounded-[10px] border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink">Novo depoimento</h2>
        <div className="mt-4"><DepoimentoForm /></div>
      </section>
      <ul className="mt-6 space-y-2">
        {(depos ?? []).map((d) => (
          <li key={d.id} className="rounded-lg border border-line bg-surface p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink">{d.nome ?? "(sem nome)"} <span className="text-xs text-ink-2">· {d.tipo} · {d.status} · ordem {d.ordem ?? 0}</span></span>
              <form action={excluirDepoimento}>
                <input type="hidden" name="id" value={d.id} />
                <button type="submit" className="text-xs text-red-600 hover:underline">Excluir</button>
              </form>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-ink-2">Editar</summary>
              <div className="mt-3"><DepoimentoForm depo={d} /></div>
            </details>
          </li>
        ))}
        {(depos ?? []).length === 0 && <li className="text-sm text-ink-2">Nenhum depoimento.</li>}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Verificar** — `npx tsc --noEmit` passa; `npx vitest run` verde. Manual: criar depoimento texto e um vídeo (URL YouTube); editar; excluir.

- [ ] **Step 5: Commit**
```
git add "platform/src/app/(admin)/admin/depoimentos" platform/src/components/admin/DepoimentoForm.tsx
git commit -m "feat(admin): CRUD de depoimentos (texto/imagem/áudio/vídeo) com auditoria"
```

---

## Task 4: Público — TestimonialCard por tipo + páginas lendo do banco

**Files:** Rewrite `src/components/TestimonialCard.tsx`; Modify `src/app/(site)/depoimentos/page.tsx` e `src/app/(site)/page.tsx`.

- [ ] **Step 1: Reescrever `src/components/TestimonialCard.tsx`**
```tsx
export type DepoimentoView = {
  tipo: string;
  nome: string;
  iniciais: string;
  contexto: string;
  texto: string | null;
  mediaUrl: string | null;
  youtubeId: string | null;
};

function Autor({ iniciais, nome, contexto }: { iniciais: string; nome: string; contexto: string }) {
  return (
    <figcaption className="mt-4 flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-navy text-sm font-semibold text-surface">{iniciais}</span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-ink">{nome}</span>
        <span className="block text-xs text-ink-3">{contexto}</span>
      </span>
    </figcaption>
  );
}

export default function TestimonialCard({ depoimento }: { depoimento: DepoimentoView }) {
  const { tipo, nome, iniciais, contexto, texto, mediaUrl, youtubeId } = depoimento;
  return (
    <figure className="mb-5 break-inside-avoid rounded-[10px] border border-line bg-surface p-6 shadow-sm">
      {tipo === "video" && youtubeId ? (
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={`Depoimento de ${nome}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : tipo === "imagem" && mediaUrl ? (
        <img src={mediaUrl} alt={`Depoimento de ${nome}`} className="w-full rounded-lg" />
      ) : tipo === "audio" && mediaUrl ? (
        <audio controls className="w-full" src={mediaUrl} />
      ) : (
        <>
          <span aria-hidden className="block text-3xl leading-none text-tan">&ldquo;</span>
          <blockquote className="mt-2 text-ink">{texto}</blockquote>
        </>
      )}
      {(texto && tipo !== "texto") && <p className="mt-3 text-sm text-ink-2">{texto}</p>}
      <Autor iniciais={iniciais} nome={nome} contexto={contexto} />
    </figure>
  );
}
```

- [ ] **Step 2: Helper de mapeamento — inline nas páginas**
Em ambas as páginas públicas, montar `DepoimentoView` a partir das linhas do banco. A imagem/áudio usa URL pública do bucket `capas`; o vídeo usa `youtubeId(video_url)`. iniciais: usar campo ou derivar do nome.

- [ ] **Step 3: `src/app/(site)/depoimentos/page.tsx`** (reescrever para ler do banco)
```tsx
import type { Metadata } from "next";
import Eyebrow from "@/components/Eyebrow";
import TestimonialCard, { type DepoimentoView } from "@/components/TestimonialCard";
import { createClient } from "@/lib/supabase/server";
import { youtubeId } from "@/lib/youtube";

export const metadata: Metadata = {
  title: "Depoimentos",
  description:
    "Histórias de quem passou pelo Instituto Brusch — O Círculo, a Cartografia e a terapia sistêmica.",
};

function iniciaisDe(nome: string) {
  return nome.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default async function DepoimentosPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonials")
    .select("id, nome, iniciais, contexto, tipo, texto, media_path, video_url")
    .eq("status", "aprovado")
    .order("ordem", { ascending: true });

  const depoimentos: DepoimentoView[] = (data ?? []).map((d) => {
    const nome = d.nome ?? "";
    const mediaUrl = d.media_path
      ? supabase.storage.from("capas").getPublicUrl(d.media_path).data.publicUrl
      : null;
    return {
      tipo: d.tipo ?? "texto",
      nome,
      iniciais: d.iniciais || iniciaisDe(nome),
      contexto: d.contexto ?? "",
      texto: d.texto,
      mediaUrl,
      youtubeId: youtubeId(d.video_url),
    };
  });

  return (
    <div className="mx-auto max-w-[1160px] px-6 py-16">
      <Eyebrow>Histórias</Eyebrow>
      <h1 className="mt-2 text-4xl text-ink">Depoimentos</h1>
      <div className="mt-10 [column-gap:1.25rem] sm:columns-2 lg:columns-3">
        {depoimentos.map((d, i) => (
          <TestimonialCard key={i} depoimento={d} />
        ))}
        {depoimentos.length === 0 && <p className="text-ink-2">Em breve.</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Home `src/app/(site)/page.tsx`** — trocar a fonte dos depoimentos por DB (3 primeiros aprovados). Tornar o componente `async`, remover `getDepoimentos` do import e adicionar os imports/fetch.

Trocar o import da linha 8:
```tsx
import { getEventos } from "@/content";
import { createClient } from "@/lib/supabase/server";
import { youtubeId } from "@/lib/youtube";
import { type DepoimentoView } from "@/components/TestimonialCard";
```
Trocar a assinatura e o cálculo (linhas 17–19) por:
```tsx
export default async function Home() {
  const eventos = getEventos().slice(0, 3);
  const supabase = await createClient();
  const { data: depoRows } = await supabase
    .from("testimonials")
    .select("nome, iniciais, contexto, tipo, texto, media_path, video_url")
    .eq("status", "aprovado")
    .order("ordem", { ascending: true })
    .limit(3);
  const iniciaisDe = (n: string) => n.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const depoimentos: DepoimentoView[] = (depoRows ?? []).map((d) => {
    const nome = d.nome ?? "";
    return {
      tipo: d.tipo ?? "texto",
      nome,
      iniciais: d.iniciais || iniciaisDe(nome),
      contexto: d.contexto ?? "",
      texto: d.texto,
      mediaUrl: d.media_path ? supabase.storage.from("capas").getPublicUrl(d.media_path).data.publicUrl : null,
      youtubeId: youtubeId(d.video_url),
    };
  });
```
No JSX que lista os destaques (perto da linha 132), o `key` usa `d.nome`; trocar por índice para evitar colisão:
```tsx
            <TestimonialCard key={i} depoimento={d} />
```
e ajustar o `.map((d) => ...)` para `.map((d, i) => ...)`. Ler o arquivo e aplicar essas mudanças mantendo o restante intacto.

- [ ] **Step 5: Verificar** — `npx tsc --noEmit` passa; `npx vitest run` verde. Manual: `/depoimentos` e a home mostram os depoimentos do banco (os 7 semeados aparecem como texto); criar um vídeo no admin e ver o embed aparecer.

- [ ] **Step 6: Commit**
```
git add platform/src/components/TestimonialCard.tsx "platform/src/app/(site)/depoimentos/page.tsx" "platform/src/app/(site)/page.tsx"
git commit -m "feat(depoimentos): site lê do banco e renderiza texto/imagem/áudio/vídeo"
```

---

## Task 5: Fechamento — testes + build

- [ ] **Step 1:** `npx vitest run` — todos verdes (inclui `youtube.test.ts`).
- [ ] **Step 2:** `npx tsc --noEmit` e `npm run build` — sem erros. Se o validador de rota reclamar, `rm -rf .next` e rebuildar. Confirmar `/admin/depoimentos` na lista de rotas e que `/depoimentos` e `/` continuam buildando.
- [ ] **Step 3:** Se houve ajustes, commit:
```
git add -A
git commit -m "chore(depoimentos): ajustes finais"
```

---

## Self-review (cobertura da spec)

- RLS: leitura pública só de aprovados → Task 1. ✅
- youtubeId testado + menu → Task 2. ✅
- Admin CRUD 4 tipos + upload (capas) + auditoria → Task 3. ✅
- Público lê do banco + render por tipo (texto/imagem/áudio/vídeo) → Task 4. ✅
- Home e página de depoimentos migradas do seed para o banco → Task 4. ✅

## Notas

- Depoimentos de imagem/áudio usam o bucket público `capas` (URL direta). Vídeo é
  embed do YouTube via `youtubeId(video_url)`.
- O seed `DEPOIMENTOS` em `src/content` fica sem uso após a migração (limpeza
  opcional futura; não quebra nada). Manter `getEventos` (a home ainda usa o seed
  de eventos — fora do escopo deste sub-projeto).
- Depoimentos de imagem exibidos com `<img>` (não `next/image`) para simplificar
  URLs de Storage; aceitável para esta página.

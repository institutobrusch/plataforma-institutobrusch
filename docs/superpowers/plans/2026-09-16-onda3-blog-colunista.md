# Blog (CRUD) + papel colunista — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gerenciar o blog no backoffice (admin e colunistas), fazer o site ler do banco, e ativar o papel colunista com acesso limitado ao Blog e aos próprios posts.

**Architecture:** Tabela `blog_posts` (já existe) ganha `author_id` e RLS por papel. O guard do `/admin` passa a aceitar admin OU colunista; o menu é filtrado por papel; todas as seções não-Blog seguem admin-only. Admin promove colunistas por e-mail (service-role). Site lê `blog_posts` publicados.

**Tech Stack:** Next.js 16 (App Router, Server Actions, `useActionState`), React 19, TypeScript, Tailwind v4, Supabase (`@supabase/ssr` + service-role), Vitest.

**Diretório de trabalho:** `platform/`. Caminhos com parênteses `(site)`/`(admin)` entre aspas no git.

---

## Task 1: Migração (author_id + RLS) + seed + tipos

**Files:**
- Migração no Supabase `jnwjrjzinqqcxlvleznq` (MCP `apply_migration`, name `13_blog_author_rls`)
- Regerar `platform/src/lib/database.types.ts`

- [ ] **Step 1: apply_migration** (name `13_blog_author_rls`):

```sql
alter table public.blog_posts
  add column if not exists author_id uuid references public.profiles(id) on delete set null;
create index if not exists blog_posts_author_id_idx on public.blog_posts(author_id);
create unique index if not exists blog_posts_slug_key on public.blog_posts(slug);

alter table public.blog_posts enable row level security;
drop policy if exists "blog pub" on public.blog_posts;
drop policy if exists "blog adm" on public.blog_posts;
drop policy if exists "blog colunista" on public.blog_posts;

create policy "blog pub" on public.blog_posts
  for select using (publicado = true);
create policy "blog adm" on public.blog_posts
  for all using (public.is_admin()) with check (public.is_admin());
create policy "blog colunista" on public.blog_posts
  for all using (public.has_role('colunista') and author_id = auth.uid())
  with check (public.has_role('colunista') and author_id = auth.uid());
```

- [ ] **Step 2: Seed dos posts** (MCP `execute_sql`) — migra o seed atual (aspas simples escapadas como `''`; corpo como array Postgres `text[]`):

```sql
insert into public.blog_posts (slug, titulo, autor, cargo, data, resumo, corpo, publicado) values
  ('o-circulo', 'O que acontece dentro de O Círculo', 'Instituto Brusch', 'Equipe', '21 ago 2026',
   'Como funciona a terapia em grupo aberta e por que o encontro com o outro cura.',
   array['O Círculo é um espaço de escuta em grupo reduzido. Não há palestra — há presença.','Ao ouvir o outro, reconhecemos partes de nós mesmos que estavam no escuro. O grupo vira espelho e sustentação.','Cada ciclo tem quatro encontros, com temas que emergem do próprio grupo.'],
   true),
  ('cartografia-mapa', 'Cartografia: um mapa para o seu momento', 'Camila Brusch', 'Psicóloga · fundadora', '5 ago 2026',
   'A carta não prevê o futuro — ela ilumina o presente. Entenda a proposta.',
   array['A cartografia do instituto é uma ferramenta de autoconhecimento, não de adivinhação.','A partir da sua carta, construímos leituras mensais, áudios e resumos que acompanham o seu processo ao longo do tempo.','É um mapa vivo: muda conforme você caminha.'],
   true),
  ('coluna-corpo', 'O corpo também lembra', 'Dra. Helena Prado', 'Colunista convidada', '18 jul 2026',
   'Colunista convidada escreve sobre a memória do corpo e o cuidado integral.',
   array['O que a mente esquece, o corpo às vezes guarda. Tensões, dores e sintomas podem ser mensagens.','Cuidar da saúde mental é também escutar o corpo — e devolver a ele um lugar na conversa terapêutica.'],
   true)
on conflict (slug) do nothing;
```

- [ ] **Step 3:** `generate_typescript_types` e sobrescrever `platform/src/lib/database.types.ts` (o `author_id` deve aparecer em `blog_posts`).
- [ ] **Step 4:** `list_tables` — confirmar `blog_posts.author_id` e as 3 policies; confirmar 3 posts publicados.
- [ ] **Step 5:** `npx tsc --noEmit` em `platform` → sem erros.
- [ ] **Step 6: Commit**

```bash
git add platform/src/lib/database.types.ts
git commit -m "feat(blog): author_id + RLS por papel e seed de posts"
```

---

## Task 2: Papéis, guardas e navegação (TDD no helper)

**Files:**
- Modify: `platform/src/lib/roles.ts` + Test: `platform/src/lib/roles.test.ts` (já existe — adicionar casos)
- Modify: `platform/src/lib/auth.ts`
- Modify: `platform/src/app/(admin)/admin/layout.tsx`
- Modify: `platform/src/components/admin/AdminShell.tsx`
- Modify: `platform/src/app/(admin)/admin/page.tsx`

- [ ] **Step 1: Teste do helper** — em `roles.test.ts` (Vitest), adicionar:

```ts
import { podeEditarBlog, podeAcessarAdmin } from "./roles";
// ...
describe("podeEditarBlog", () => {
  it("admin e colunista podem", () => {
    expect(podeEditarBlog("admin")).toBe(true);
    expect(podeEditarBlog("colunista")).toBe(true);
  });
  it("demais não podem", () => {
    for (const p of ["member", "moderador", null, undefined, ""]) expect(podeEditarBlog(p as string)).toBe(false);
  });
});
describe("podeAcessarAdmin com colunista", () => {
  it("admin e colunista acessam o shell", () => {
    expect(podeAcessarAdmin("admin")).toBe(true);
    expect(podeAcessarAdmin("colunista")).toBe(true);
  });
  it("member não acessa", () => { expect(podeAcessarAdmin("member")).toBe(false); });
});
```

- [ ] **Step 2: Rodar teste (falha)** — `npx vitest run src/lib/roles.test.ts` → FAIL (`podeEditarBlog` indefinido / `podeAcessarAdmin` ainda não aceita colunista).

- [ ] **Step 3: Implementar em `roles.ts`**:

```ts
export type Papel = "member" | "admin" | "moderador" | "colunista";

export function isAdminRole(papel: string | null | undefined): boolean {
  return papel === "admin";
}
export function podeEditarBlog(papel: string | null | undefined): boolean {
  return papel === "admin" || papel === "colunista";
}
// Admin ou colunista carregam o shell do /admin; cada seção não-Blog exige admin.
export function podeAcessarAdmin(papel: string | null | undefined): boolean {
  return isAdminRole(papel) || papel === "colunista";
}
```

- [ ] **Step 4: Rodar teste (passa)** — `npx vitest run src/lib/roles.test.ts` → PASS.

- [ ] **Step 5: `auth.ts` — novo guard `requireBlogAutor`** (mantém `requireAdmin` inalterado):

```ts
import { podeEditarBlog } from "@/lib/roles"; // adicionar ao topo se necessário

export async function requireBlogAutor() {
  const user = await getUser();
  if (!user) redirect("/entrar");
  const role = await getMinhaRole();
  if (!podeEditarBlog(role)) redirect("/app");
  return { user, role };
}
```

- [ ] **Step 6: Layout admin** — `src/app/(admin)/admin/layout.tsx`: trocar `await requireAdmin();` por `const { role } = await requireBlogAutor();` e passar `papel={role}` ao `AdminShell` (além de `nome`).

- [ ] **Step 7: AdminShell filtra menu** — em `AdminShell.tsx`:
  - Adicionar item ao `MENU`: `{ href: "/admin/blog", label: "Blog" }` (após "Depoimentos").
  - Aceitar prop `papel: string | null`.
  - Ao renderizar: se `papel !== "admin"` (colunista), exibir **apenas** o item de `/admin/blog`; senão, o `MENU` completo.
  ```ts
  const itens = papel === "admin" ? MENU : MENU.filter((m) => m.href === "/admin/blog");
  ```
  Usar `itens.map(...)` no lugar de `MENU.map(...)`.

- [ ] **Step 8: Índice `/admin` redireciona colunista** — em `src/app/(admin)/admin/page.tsx`, no topo do componente (é server): buscar a role e, se colunista, `redirect("/admin/blog")` (import `getMinhaRole` de `@/lib/auth`, `redirect` de `next/navigation`). Não alterar o resto do dashboard (que é admin).

- [ ] **Step 9: Verificar** — `npx vitest run` (tudo verde) + `npx tsc --noEmit`.

- [ ] **Step 10: Commit**

```bash
git add platform/src/lib/roles.ts platform/src/lib/roles.test.ts platform/src/lib/auth.ts platform/src/app/"(admin)"/admin/layout.tsx platform/src/components/admin/AdminShell.tsx platform/src/app/"(admin)"/admin/page.tsx
git commit -m "feat(blog): papel colunista acessa /admin so no Blog (guardas + menu filtrado)"
```

---

## Task 3: Site público lendo do banco

**Files:**
- Modify: `platform/src/app/(site)/blog/page.tsx`
- Modify: `platform/src/app/(site)/blog/[slug]/page.tsx`
- Modify: `platform/src/components/PostCard.tsx` (se necessário para a URL de capa)

- [ ] **Step 1: Lista `/blog`** — tornar `async`; ler do banco:

```ts
import { createClient } from "@/lib/supabase/server";
// ...
const supabase = await createClient();
const { data: posts } = await supabase
  .from("blog_posts")
  .select("slug, titulo, autor, cargo, data, resumo, imagem_path, created_at")
  .eq("publicado", true)
  .order("created_at", { ascending: false });
```
Mapear cada linha para o formato do `PostCard` (capa: `imagem_path ? getPublicUrl` : undefined). Preservar o markup/grid atual. Manter `export const metadata` (estático).

- [ ] **Step 2: Detalhe `/blog/[slug]`** — remover `generateStaticParams`; tornar a página dinâmica lendo por slug:

```ts
const supabase = await createClient();
const { data: post } = await supabase.from("blog_posts")
  .select("*").eq("slug", slug).eq("publicado", true).maybeSingle();
if (!post) notFound();
```
Renderizar `post.corpo` (string[]), `post.data`, `post.titulo`, autor/cargo no rodapé, capa se houver. `generateMetadata` lê o mesmo post (título/resumo). Preservar o markup atual.

- [ ] **Step 3: PostCard** — garantir que aceita `imagemUrl` opcional a partir de `imagem_path`. Se o componente hoje espera o tipo do seed, ajuste para aceitar os campos vindos do banco (mesmos nomes) sem mudar o visual.

- [ ] **Step 4: Verificar** — `npm run build`; `/blog` e `/blog/[slug]` renderizam os 3 posts do seed migrado, sem erro.

- [ ] **Step 5: Commit**

```bash
git add platform/src/app/"(site)"/blog platform/src/components/PostCard.tsx
git commit -m "feat(blog): site le posts do banco (publicados)"
```

---

## Task 4: Admin — CRUD de posts

**Files:**
- Create: `platform/src/app/(admin)/admin/blog/{page.tsx,actions.ts}`
- Create: `platform/src/components/admin/PostForm.tsx`

- [ ] **Step 1: Actions** — `actions.ts` (padrão Depoimentos + `requireBlogAutor`; usa `slugify` de `@/lib/admin/slug`, `montarNomeArquivo` de `@/lib/admin/carto`, `registrarAcao`):

```ts
"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireBlogAutor } from "@/lib/auth";
import { registrarAcao } from "@/lib/admin/audit";
import { montarNomeArquivo } from "@/lib/admin/carto";
import { slugify } from "@/lib/admin/slug";

export type PostState = { ok?: boolean; erro?: string } | null;

export async function salvarPost(_prev: PostState, fd: FormData): Promise<PostState> {
  const { user, role } = await requireBlogAutor();
  const id = String(fd.get("id") ?? "");
  const titulo = String(fd.get("titulo") ?? "").trim();
  if (!titulo) return { erro: "Informe o título." };
  const slug = (String(fd.get("slug") ?? "").trim() || slugify(titulo));
  const resumo = String(fd.get("resumo") ?? "").trim() || null;
  const data = String(fd.get("data") ?? "").trim() || null;
  const autor = String(fd.get("autor") ?? "").trim() || null;
  const cargo = String(fd.get("cargo") ?? "").trim() || null;
  const publicado = fd.get("publicado") === "on" || fd.get("publicado") === "true";
  const corpo = String(fd.get("corpo") ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
  const supabase = await createClient();

  let imagem_path: string | undefined;
  const img = fd.get("imagem") as File | null;
  if (img && img.size > 0) {
    const nome = montarNomeArquivo(img.name, "blog");
    const { error: upErr } = await supabase.storage.from("capas").upload(nome, img, { contentType: img.type || "application/octet-stream", upsert: false });
    if (upErr) return { erro: "Falha ao enviar a capa." };
    imagem_path = nome;
  }

  const base = { titulo, slug, resumo, data, autor, cargo, publicado, corpo };
  if (id) {
    // colunista só edita os próprios (RLS barra; checagem amigável no server)
    if (role !== "admin") {
      const { data: dono } = await supabase.from("blog_posts").select("author_id").eq("id", id).maybeSingle();
      if (!dono || dono.author_id !== user.id) return { erro: "Você só pode editar os seus posts." };
    }
    const patch: typeof base & { imagem_path?: string } = { ...base };
    if (imagem_path) patch.imagem_path = imagem_path;
    const { error } = await supabase.from("blog_posts").update(patch).eq("id", id);
    if (error) return { erro: error.code === "23505" ? "Já existe um post com esse slug." : "Não foi possível salvar." };
    await registrarAcao("update_blog_post", { entidade: "blog_posts", entidadeId: id });
  } else {
    const { data: row, error } = await supabase.from("blog_posts")
      .insert({ ...base, imagem_path: imagem_path ?? null, author_id: user.id }).select("id").single();
    if (error) return { erro: error.code === "23505" ? "Já existe um post com esse slug." : "Não foi possível criar." };
    await registrarAcao("create_blog_post", { entidade: "blog_posts", entidadeId: row.id });
  }
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  return { ok: true };
}

export async function excluirPost(fd: FormData) {
  const { user, role } = await requireBlogAutor();
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const { data: p } = await supabase.from("blog_posts").select("author_id, imagem_path, slug").eq("id", id).maybeSingle();
  if (!p) return;
  if (role !== "admin" && p.author_id !== user.id) return;
  if (p.imagem_path) await supabase.storage.from("capas").remove([p.imagem_path]);
  await supabase.from("blog_posts").delete().eq("id", id);
  await registrarAcao("delete_blog_post", { entidade: "blog_posts", entidadeId: id });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}
```

- [ ] **Step 2: PostForm** — `PostForm.tsx` (client, `useActionState(salvarPost, null)`): props `inicial?` (post) e `autorPadrao?`/`cargoPadrao?` (default do perfil ao criar). Campos: hidden `id`; `titulo`; `slug` (placeholder "auto do título"); `resumo` (textarea); `data`; `autor` (default `autorPadrao`); `cargo` (default `cargoPadrao`); `corpo` (textarea — um parágrafo por linha; ao editar, `inicial.corpo.join("\n")`); `imagem` (file, com preview da capa atual se houver — use `<img>` + eslint-disable); `publicado` (checkbox, default desmarcado ao criar). Botão Salvar com pending + mensagens. Reutilizar classes do padrão admin (ver `DepoimentoForm.tsx`).

- [ ] **Step 3: Page `/admin/blog`** — server, `const { user, role } = await requireBlogAutor();` + `const profile = await getProfile();`. Query dos posts:
  - admin: todos (`order created_at desc`).
  - colunista: `.eq("author_id", user.id)`.
  Renderizar: título "Blog", form "Novo post" (`<PostForm autorPadrao={profile?.nome ?? ""} cargoPadrao={role === "colunista" ? "Colunista" : "Equipe"} />`), e a lista com `<details>` por post contendo `<PostForm inicial={post} />` + form de exclusão (`action={excluirPost}` com hidden `id`). Mostrar um selo "rascunho/publicado" por item. **Se `role === "admin"`**, incluir também o painel de Colunistas da Task 5 (ou link para `/admin/blog/colunistas`).

- [ ] **Step 4: Verificar** — `npm run build`; criar/editar/excluir post reflete em `/blog`.

- [ ] **Step 5: Commit**

```bash
git add platform/src/app/"(admin)"/admin/blog platform/src/components/admin/PostForm.tsx
git commit -m "feat(admin): CRUD de posts do blog (admin e colunista, escopo por autor)"
```

---

## Task 5: Painel de Colunistas (só admin)

**Files:**
- Create: `platform/src/app/(admin)/admin/blog/colunistas/{page.tsx,actions.ts}` + `ColunistaForm.tsx`
- (ou embutir na page `/admin/blog` — mas manter arquivos de action separados)

- [ ] **Step 1: Actions** — `colunistas/actions.ts`:

```ts
"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { registrarAcao } from "@/lib/admin/audit";

export type ColunistaState = { ok?: boolean; erro?: string } | null;

export async function promoverColunista(_prev: ColunistaState, fd: FormData): Promise<ColunistaState> {
  await requireAdmin();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (!email) return { erro: "Informe o e-mail." };
  const admin = createAdminClient();
  const { data: list } = await admin.auth.admin.listUsers();
  const u = list?.users.find((x) => (x.email ?? "").toLowerCase() === email);
  if (!u) return { erro: "Nenhum usuário com esse e-mail (a pessoa precisa ter conta)." };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ papel: "colunista" }).eq("id", u.id);
  if (error) return { erro: "Não foi possível promover." };
  await registrarAcao("promote_colunista", { entidade: "profiles", entidadeId: u.id, detalhe: { email } });
  revalidatePath("/admin/blog/colunistas");
  return { ok: true };
}

export async function rebaixarColunista(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("profiles").update({ papel: "member" }).eq("id", id).eq("papel", "colunista");
  await registrarAcao("demote_colunista", { entidade: "profiles", entidadeId: id });
  revalidatePath("/admin/blog/colunistas");
}
```

- [ ] **Step 2: Page** — `colunistas/page.tsx` (server, `await requireAdmin()`): lista os colunistas atuais (`profiles` where `papel = 'colunista'`, mostrando `nome` e id; para o e-mail, cruzar com `createAdminClient().auth.admin.listUsers()`), com botão "Rebaixar" por linha (`action={rebaixarColunista}`), e o form de promover (`<ColunistaForm />` usando `promoverColunista`). Título "Colunistas" + link Voltar para `/admin/blog`.

- [ ] **Step 3: ColunistaForm** — client, `useActionState(promoverColunista, null)`: input `email` + botão "Promover a colunista" + mensagens ok/erro.

- [ ] **Step 4: Link a partir de `/admin/blog`** — na page da Task 4, quando `role === "admin"`, mostrar um link/botão "Gerenciar colunistas" para `/admin/blog/colunistas`.

- [ ] **Step 5: Verificar** — `npm run build`; promover um usuário existente a colunista e confirmar que, ao logar como ele, o `/admin` mostra só "Blog".

- [ ] **Step 6: Commit**

```bash
git add platform/src/app/"(admin)"/admin/blog/colunistas platform/src/components/admin/ColunistaForm.tsx
git commit -m "feat(admin): painel de colunistas (promover/rebaixar por e-mail)"
```

---

## Task 6: Verificação de fechamento e push

- [ ] **Step 1:** `npx vitest run` → tudo verde (inclui `roles.test.ts`).
- [ ] **Step 2:** `npx tsc --noEmit` e `npm run build` sem erros; confirmar rotas `/admin/blog`, `/admin/blog/colunistas`, `/blog`, `/blog/[slug]` no output.
- [ ] **Step 3: Sanidade:** `/blog` mostra os 3 posts migrados; um colunista promovido vê só "Blog" no `/admin` e não acessa `/admin/produtos` (redirect).
- [ ] **Step 4: Push** — `git push origin main`.
- [ ] **Step 5:** Confirmar deploy READY na Vercel e checar `/blog` no ar.

---

## Notas (DRY / convenções)

- Reusar `requireBlogAutor()` nas rotas de Blog e `requireAdmin()` nas de colunistas; nunca relaxar `requireAdmin()`.
- Server Actions retornam `{ ok } | { erro }`; forms usam `useActionState` + `pending`.
- Uploads no bucket `capas`, subpasta `blog/`.
- `corpo` no form: um parágrafo por linha (split `\n`, trim, filtra vazias).
- Slug via `slugify(titulo)` quando o campo vier vazio; erro 23505 → mensagem amigável.
- Caminhos com parênteses entre aspas no `git add`.

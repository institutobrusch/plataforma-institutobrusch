# Onda 3 — Blog (CRUD) + papel colunista — design

Data: 2026-09-16
Status: aprovado (aguarda revisão final do Iago)
Segundo sub-projeto da Onda 3 (o 1º — Configurações do site — está concluído).

## Contexto

O `/blog` e `/blog/[slug]` leem do **seed** (`src/content/data.ts`, export `POSTS`),
com campos: slug, titulo, autor, cargo, data, resumo, corpo (string[]), imagemUrl.
Já existe a tabela **`blog_posts`** no Supabase (id, slug, titulo, resumo, corpo
string[], autor, cargo, data, imagem_path, publicado, created_at) — mas ninguém
lê/escreve nela ainda. O papel **`colunista`** já está no tipo `Papel`
(`src/lib/roles.ts`) e a função `public.has_role(role)` existe no banco, porém o
acesso ao `/admin` hoje é **só admin** (`podeAcessarAdmin` = admin).

Objetivo: (1) admin/colunista gerenciam posts no backoffice; (2) o site lê do
banco; (3) ativar o papel colunista com acesso limitado ao Blog e aos próprios
posts.

## Decisões (validadas com o Iago)

1. **Publicação:** colunista **publica direto** (cria/edita/publica os próprios
   posts sem aprovação). Admin gerencia todos os posts e o resto da plataforma.
2. **Alcance do colunista:** vê **apenas a seção Blog** no admin e gerencia
   **somente os próprios posts** (`author_id = auth.uid()`).
3. **Designar colunista:** painel "Colunistas" dentro de `/admin/blog` (visível só
   ao admin): promove um usuário por e-mail, lista os atuais, rebaixa para member.
4. **Conteúdo do post:** campos estruturados (corpo = parágrafos), capa por upload,
   autor/cargo pré-preenchidos do perfil e editáveis. Slug auto do título, editável.
5. **Seed:** migrar os posts do seed atual para `blog_posts` (publicados) para o
   `/blog` não ficar vazio.

## Estado do banco

`blog_posts` já existe. **Uma migração** adiciona autoria e ajusta RLS:

```sql
alter table public.blog_posts
  add column if not exists author_id uuid references public.profiles(id) on delete set null;
create index if not exists blog_posts_author_id_idx on public.blog_posts(author_id);

-- RLS (recriar policies de forma idempotente)
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

Seed (execute_sql, a partir do export `POSTS` do seed): inserir cada post com
`publicado = true`, `author_id = null` (posts institucionais), preservando slug,
titulo, resumo, corpo, autor, cargo, data. Ignorar duplicatas por slug
(`on conflict (slug) do nothing`).

Regerar `src/lib/database.types.ts` após a migração.

Bucket de imagens: **`capas`** (público), subpasta `blog/`.

## Papéis e guardas

- `src/lib/roles.ts`:
  - `podeAcessarAdmin(papel)` passa a aceitar **admin OU colunista** (permite o
    colunista carregar o shell do admin).
  - novo `podeEditarBlog(papel)` = admin OU colunista.
- `src/lib/auth.ts`:
  - `requireAdmin()` **inalterado** (só admin) — protege todas as seções não-Blog.
  - novo `requireBlogAutor()` — permite admin OU colunista (senão redireciona:
    logado sem papel → `/app`; deslogado → `/entrar`). Retorna `{ user, role }`.
- `src/app/(admin)/admin/layout.tsx`: troca `requireAdmin()` por um guard que
  aceita admin OU colunista (ex.: usar `requireBlogAutor()` no layout).
- `AdminShell`: recebe o papel e **filtra o menu** — colunista vê só "Blog"
  (e "Sair"); admin vê o menu completo com "Blog" incluído.

Como todas as ações das outras seções continuam chamando `requireAdmin()`, um
colunista que tente `/admin/produtos` (etc.) por URL é redirecionado.

## Arquitetura

- **Admin `/admin/blog`:**
  - Lista de posts: admin vê todos; colunista vê os próprios (filtro por
    `author_id`). Criar/editar/excluir via `<PostForm>` (padrão dos outros CRUDs).
  - Campos do form: `titulo`, `slug` (auto via `slugify`, editável), `resumo`,
    `data` (texto livre, ex. "21 ago 2026"), `corpo` (ListField "lines" →
    string[]), `imagem` (upload → `capas/blog/`), `autor`, `cargo`, `publicado`
    (checkbox). Autor/cargo default do perfil (`profiles.nome`) na criação.
  - Server Actions (`/admin/blog/actions.ts`) após `requireBlogAutor()`:
    - Criar: seta `author_id = user.id`; slug único (trata 23505 com mensagem).
    - Editar/excluir: se colunista, **exige** que o post seja dele (RLS já barra,
      mas checar no server e devolver erro amigável); admin sem restrição.
    - `registrarAcao()` (auditoria) + `revalidatePath('/blog')`, do post e de
      `/admin/blog`. Upload/remoção de capa no servidor.
  - **Painel "Colunistas" (só admin)**, na mesma página `/admin/blog` ou em
    `/admin/blog/colunistas`: form "promover por e-mail" (usa `createAdminClient`
    para achar o usuário e setar `profiles.papel='colunista'`), lista de
    colunistas atuais e ação "rebaixar" (papel='member'). Guardado por
    `requireAdmin()` (não `requireBlogAutor`).
- **Site público:** `/blog` e `/blog/[slug]` passam a `async`, lendo `blog_posts`
  com `publicado = true` (ordenados por `created_at` desc). Capa via
  `imagemUrl(imagem_path, fallback)`. `/blog/[slug]` usa `.maybeSingle()` por slug
  e `notFound()` se ausente/não publicado. `generateMetadata` a partir do post.
  Sem `generateStaticParams` (render dinâmico) — conteúdo muda pelo admin.
- **PostCard**: ajustar para aceitar o formato vindo do banco (campos iguais aos
  do seed; mapear `imagem_path`→URL). Mantém o visual atual.

## Testes

- **Puro (Vitest):** `podeEditarBlog(papel)` (admin/colunista true; member/mod/null
  false) e reuso de `slugify` (já testado). `montarNomeArquivo` (já testado) p/ capa.
- CRUD/upload/escopo por papel: build + type-check + teste manual guiado.

## Fora de escopo (YAGNI)

- Editor de texto rico (parágrafos estruturados apenas).
- Categorias/tags, busca, comentários no blog.
- Agendamento de publicação; fluxo de rascunho/aprovação (publish é direto).
- SEO além de título/resumo.
- Convite específico de colunista (promoção é por e-mail no painel; o cadastro do
  usuário segue o fluxo normal de conta).

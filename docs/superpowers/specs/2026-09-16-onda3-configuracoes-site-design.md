# Onda 3 — Configurações do site (editor de conteúdo institucional) — design

Data: 2026-09-16
Status: aprovado (aguarda revisão final do Iago)
Primeiro sub-projeto da Onda 3 (backoffice de conteúdo institucional). Fecha a
lacuna: hoje o admin edita catálogo/depoimentos/cursos/cartografia, mas os
**textos e imagens padrão das páginas** (home, instituto, camila, faq, contato,
marca e contatos globais) estão fixos no código.

## Contexto

As páginas institucionais renderizam conteúdo hard-coded:
- **Home** (`(site)/page.tsx`): eyebrow "Palmas · Tocantins", título do hero,
  subtítulo, 2 CTAs e 4 blocos de destaque (título + texto cada).
- **/instituto** (`(site)/instituto/page.tsx`): conteúdo institucional.
- **/camila** (`(site)/camila/page.tsx`): foto, eyebrow, nome, resumo, lista de
  formação/atuação (itens), 2 subtítulos + parágrafos e 2 CTAs.
- **/faq** (`(site)/faq/page.tsx`): lê o seed `FAQ` de `src/content/data.ts`.
- **/contato** (`(site)/contato/page.tsx`): canais (Instagram, cidade) + textos.
- **Marca/contatos globais**: `Header.tsx` e `Footer.tsx` (logo, tagline do
  rodapé, Instagram, cidade/UF, colunas de links) e o favicon (`app/icon.png`).

O admin precisa editar tudo isso sem tocar em código.

## Decisões (validadas com o Iago)

1. **Escopo completo:** páginas institucionais (home, instituto, camila, faq) +
   global (marca, contatos, redes, rodapé) + imagens (logo, favicon, foto da
   Camila) + SEO por página (title/description).
2. **Edição por campos estruturados** (não editor de texto rico): cada peça em
   seu campo (título, subtítulo, parágrafos, itens de lista, texto de botão).
   Preserva o layout e é difícil de quebrar. Parágrafos longos = `textarea`.
3. **Modelo de dados (Opção A):** tabela `site_content` com **uma linha por
   seção** guardando um objeto `jsonb`; FAQ em tabela própria (`faq_items`,
   lista com ordem). Poucas tabelas, evolui campo sem migração nova.
4. **Publish imediato:** salvar já vai ao ar (com `revalidatePath`), igual aos
   demais CRUDs do admin. Sem rascunho/versionamento.
5. **Defaults no código + merge:** a leitura mescla o JSON do banco **sobre**
   um objeto default (o conteúdo atual). Campo/linha ausente cai no default —
   o site nunca renderiza vazio, e a migração é segura.
6. **Marca d'água:** a `/brand/logo-mark.svg` (vetorizada nesta sessão)
   permanece fixa; não entra no editor.

## Estado do banco (a criar)

Nenhuma tabela existe hoje. **Uma migração** cria:

```sql
create table if not exists public.site_content (
  chave text primary key,
  valor jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.faq_items (
  id uuid primary key default gen_random_uuid(),
  pergunta text not null,
  resposta text not null,
  ordem int not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.site_content enable row level security;
alter table public.faq_items enable row level security;

-- leitura pública; escrita só admin
create policy "site_content pub" on public.site_content for select using (true);
create policy "site_content adm" on public.site_content for all
  using (public.is_admin()) with check (public.is_admin());

create policy "faq pub" on public.faq_items for select using (ativo or public.is_admin());
create policy "faq adm" on public.faq_items for all
  using (public.is_admin()) with check (public.is_admin());
```

Seed inicial (na própria migração ou via script): inserir as linhas `marca`,
`home`, `instituto`, `camila`, `contato` com o conteúdo atual, e os itens de FAQ
a partir do seed `FAQ` de `src/content/data.ts`. Isso mantém o site idêntico.

Bucket usado para imagens: **`capas`** (público) — subpasta `site/`.

## Chaves e campos (site_content.valor)

Cada seção é um objeto tipado. Campos de imagem guardam o **path** no bucket
`capas` (ou vazio = usa o default do código). Campos SEO por página.

- **marca** (aplica em Header/Footer/entrar):
  `logoGoldPath`, `logoNavyPath`, `faviconPath`, `rodapeTagline`,
  `instagramUrl`, `instagramHandle`, `cidadeUf`.
- **home**: `eyebrow`, `heroTitulo`, `heroTituloEnfase` (trecho em itálico/tan),
  `heroTituloFim`, `heroSubtitulo`, `ctaPrimarioLabel`, `ctaPrimarioHref`,
  `ctaSecundarioLabel`, `ctaSecundarioHref`, `blocos` (array de 4:
  `{titulo, texto}`), `seoTitle`, `seoDescription`.
- **instituto**: `fotoPath`, `eyebrow`, `titulo`, `subtitulo`,
  `frentesTitulo` (rótulo do bloco lateral, ex.: "Nossas frentes"),
  `frentes` (array de `{destaque, texto}` → renderiza `<b>{destaque}</b> — {texto}`),
  `secoes` (array de `{titulo, paragrafos: string[]}`), `cta` (`{label, href}`),
  `seoTitle`, `seoDescription`.
- **camila**: `fotoPath`, `eyebrow`, `nome`, `resumo`,
  `formacao` (string[]), `secoes` (array de `{titulo, paragrafos: string[]}`),
  `ctas` (array de `{label, href, variant}`), `seoTitle`, `seoDescription`.
- **contato**: `eyebrow`, `titulo`, `canais` (array de `{label, valor, href?}`),
  `textoAcesso`, `seoTitle`, `seoDescription`.
- **faq (página)**: `seoTitle`, `seoDescription` em `site_content` (chave `faq`);
  as perguntas ficam em `faq_items`.

Objetos default (idênticos ao conteúdo atual) vivem em `src/lib/site/defaults.ts`
como fonte da verdade dos formatos e dos fallbacks.

## Arquitetura

- **Leitura:** `src/lib/site/content.ts` com `getConteudo(chave)` (server): busca
  a linha, faz deep-merge do `valor` sobre o default tipado e retorna o objeto.
  `getFaq()` lista `faq_items` ativos por ordem (com fallback ao default se vazio).
  Helper `imagemUrl(path)` → `getPublicUrl` no bucket `capas`, ou o asset default.
- **Site:** as páginas `/`, `/instituto`, `/camila`, `/faq`, `/contato` passam a
  `async` e leem via `getConteudo`/`getFaq`; `Header`/`Footer` leem `marca`;
  `generateMetadata` de cada página usa os campos SEO. Favicon dinâmico via rota
  `app/icon.tsx` que redireciona/serve o `faviconPath` (fallback ao atual).
- **Admin:** item **"Site"** no `AdminShell` → `/admin/site`. Uma página com
  seções (Marca & Contatos, Home, Instituto, Camila, Contato, FAQ, SEO). Cada
  seção é um `<form>` com os campos estruturados; arrays (blocos, seções,
  formação, canais) editados com campos repetidos (add/remover/reordenar simples).
  FAQ é lista CRUD (add/editar/excluir/reordenar), padrão Depoimentos.
- **Server Actions** (`/admin/site/actions.ts`): `salvarSecao(chave, dados)` e as
  ações de FAQ. Todas após `requireAdmin()`, com `registrarAcao()` (auditoria) e
  `revalidatePath` das rotas afetadas (`/`, `/instituto`, `/camila`, `/faq`,
  `/contato` e o layout do site para Header/Footer). Upload/remoção de imagem no
  servidor (bucket `capas`, subpasta `site/`), nomeando com `montarNomeArquivo`.

## Testes

- **Puro (Vitest):** `mergeConteudo(default, valor)` (deep-merge com fallback de
  campos ausentes e arrays) — casos: vazio, parcial, array substituído.
- Reuso de helpers já testados (`slugify` n/a; `montarNomeArquivo` para imagens).
- CRUD/upload/render por seção: build + type-check + teste manual guiado.

## Fora de escopo (YAGNI aqui)

- Editor de texto rico (negrito/links) — campos estruturados apenas.
- Rascunho, pré-visualização e versionamento de conteúdo.
- Blog e catálogo (já são áreas próprias).
- Papéis parciais (colunista/editor) — segue só `is_admin()`.
- Reordenar/adicionar seções de página livremente além dos arrays previstos
  (os 4 blocos da home permanecem 4).

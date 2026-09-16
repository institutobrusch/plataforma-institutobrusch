# Onda 2 — CRUD de catálogo (Produtos, Eventos, E-books) — design

Data: 2026-09-15
Status: aprovado (aguarda revisão final do Iago)
Sub-projeto 2 da Onda 2 (o 1º — Cartografia por cliente — já concluído; o 3º — criar depoimentos — terá spec/plano próprios; cursos ficam para um sub-projeto à parte por causa da hierarquia módulos/aulas).

## Contexto

O backoffice já tem base `/admin`, dashboard, pensamento diário, moderação,
acessos, convites, auditoria e a Cartografia por cliente. Falta ao admin
gerenciar o **catálogo**: produtos, eventos e e-books (criar/editar/ativar/
excluir), que hoje só existem como seed.

O site público já lê essas tabelas: eventos em `/eventos` (+ `/eventos/[slug]`),
e-books em `/ebooks`, e produtos alimentam o acesso (`user_products`).

## Decisões (validadas com o Iago)

1. **Escopo:** Produtos, Eventos, E-books (cursos fora daqui).
2. **Exclusão:** toggle `ativo` (esconder/mostrar, reversível) **e** excluir de
   vez (remove registro + arquivos no Storage).
3. **Slug:** gerado do título ao **criar** (editável); ao **editar**, manual.
   Slug duplicado → erro amigável. Helper `slugify` testado.
4. **Produtos (tratamento especial):** `products` controla acesso
   (`has_product('cartografia')`, concessões). Editar nome/preço/tipo/ativo é
   livre; a tela **avisa** que mudar o **slug** de um produto em uso é arriscado;
   **excluir** produto com clientes vinculados (`user_products`) é **bloqueado**
   com mensagem.

## Estado do banco (confirmado)

- `products(id, nome, slug, tipo, preco, ativo, created_at)` — todos NOT NULL
  exceto created_at default.
- `events(id, slug, titulo, descricao, data, local, tipo, preco, poster_path,
  vagas, ativo, created_at)`.
- `ebooks(id, slug, titulo, descricao, preco, capa_path, arquivo_path, ativo,
  created_at)`.
- RLS: as três já têm policy **admin** (`is_admin()`, cmd ALL) + leitura pública
  dos ativos (`ativo OR is_admin()`). **Nenhuma migração de RLS necessária.**
- Buckets: `capas` (público — capas/posters), `ebooks` (privado — PDF).

Nenhuma migração de schema é necessária neste sub-projeto.

## Arquitetura

- Três páginas de admin, mesmo padrão de lista + formulário:
  - `/admin/produtos`, `/admin/eventos`, `/admin/ebooks`.
- Menu lateral do admin (`AdminShell`) atualizado para incluir **Cartografia**
  (link que faltava) + **Produtos, Eventos, E-books**.
- **Server Actions** (`"use server"`) por entidade, sempre após `requireAdmin()`,
  gravando em `audit_log`. Uploads e exclusões de arquivo no Storage no servidor.
- **Slug:** ao criar, se o campo vier vazio, gerar de `slugify(titulo)`; na
  edição, usar o valor do campo. Violação de unicidade (código Postgres `23505`)
  → retorno `{ erro: "Já existe um item com esse slug." }`.

## Padrão de cada entidade

**Lista:** tabela (título, preço formatado, status ativo) com ações: editar
(abre form preenchido via `<details>`), ativar/desativar (toggle), excluir.

**Formulário (criar/editar):**
- **Produtos:** nome, slug, tipo, preço, ativo. Aviso visível ao editar slug.
- **Eventos:** título, slug, descrição, data, local, tipo (presencial/online),
  preço, vagas, capa/poster (upload → `capas`), ativo.
- **E-books:** título, slug, descrição, preço, capa (upload → `capas`),
  arquivo PDF (upload → `ebooks`), ativo.

**Exclusão:**
- Produtos: bloquear se houver `user_products` vinculados (contagem > 0).
- Eventos/E-books: remover arquivos no Storage (poster/capa/PDF) e apagar a linha.

## Segurança e consistência

- Toda escrita passa por `requireAdmin()`; o admin usa o client comum (policies
  `is_admin()` autorizam). Preços tratados como número (`Number`), vazio = 0.
- O que o admin salva reflete no site público (eventos/e-books) e no acesso
  (produtos).

## Testes

- `slugify` (puro, Vitest): acentos, espaços, caracteres especiais, colapso de
  hífens, string vazia.
- CRUD/upload verificados por build + type-check + teste manual guiado.

## Fora de escopo (YAGNI aqui)

- Cursos (módulos/aulas/YouTube) — sub-projeto próprio.
- Criar depoimentos — sub-projeto próprio.
- Reordenação drag-and-drop; paginação das listas (poucos itens por ora).
- Redirect automático quando o slug muda (evitar por isso o alerta em Produtos).

# Onda 2 — Cartografia por cliente (admin) — design

Data: 2026-09-15
Status: aprovado (aguarda revisão final do Iago)
Sub-projeto 1 da Onda 2 (os demais — CRUD de catálogo e criação de depoimentos — terão spec/plano próprios).

## Contexto

O backoffice (Onda 1) já tem base `/admin` protegida por papel, dashboard,
pensamento diário, moderação, acessos, convites e auditoria. A Cartografia é o
produto central: cada cliente tem uma **carta individual**, **sessões** (áudio +
resumo) e **materiais**. Falta ao admin gerenciar esse conteúdo **por cliente**.

O lado do cliente já lê tudo em `/app/cartografia` (arquivo
`src/app/app/cartografia/page.tsx` + `CartografiaTabs`): carta (título,
explicação, tópicos), sessões (áudio via signed URL do bucket `audios`) e
materiais (arquivo via signed URL do bucket `materiais`, ou URL externa).

## Decisões (validadas com o Iago)

1. **Seleção de cliente:** a lista mostra só clientes com o produto
   `cartografia` **ativo** (`user_products`), com busca por nome/e-mail.
2. **Materiais:** podem ser **de uma sessão** ou **gerais da carta** →
   `carto_materials.session_id` passa a ser **opcional** (migração aditiva).
3. **CRUD completo:** admin cria, edita e exclui sessões e materiais; excluir
   remove também o arquivo no Storage.
4. Sub-projeto isolado: catálogo e depoimentos ficam fora daqui.

## Estado do banco (confirmado)

- `carto_cartas(id, user_id, titulo, explicacao, imagem_path, topicos text[], created_at)`.
- `carto_sessions(id, user_id, titulo, resumo, audio_path, data, duracao, ordem, created_at)`.
- `carto_materials(id, user_id, session_id, titulo, tipo, arquivo_path, url, created_at)`.
- RLS: além das policies "próprias" (cliente vê as suas), já existem policies
  **admin** (`is_admin()`, cmd ALL) nas três tabelas → **o admin já pode
  ler/gravar a carta de qualquer cliente. Nenhuma mudança de RLS é necessária.**
- Buckets: `audios` (privado), `materiais` (privado), `cartas` (privado),
  `capas` (público).

### Única migração necessária
- `alter table public.carto_materials alter column session_id drop not null;`
  (permite material geral da carta, sem sessão). O FK de `session_id` aceita
  null naturalmente.

## Arquitetura

- **`/admin/cartografia`** — lista de clientes com Cartografia (nome + e-mail +
  busca). E-mail vem via service-role (`listUsers`), pois `profiles` não guarda
  e-mail; a listagem é server-side e admin-gated (`requireAdmin`).
- **`/admin/cartografia/[userId]`** — painel da carta do cliente, com três
  seções na mesma página:
  1. **Carta** — form (título, explicação, imagem opcional → bucket `cartas`,
     tópicos como lista editável). Salvar faz **upsert** (1 carta por cliente).
  2. **Sessões** — form "Nova sessão" + lista; cada item editável (`<details>`
     com form preenchido) e com excluir. Áudio → bucket `audios`.
  3. **Materiais** — form "Novo material" + lista; cada item editável e com
     excluir. Tipo: áudio/pdf/texto/link. Arquivo → bucket `materiais` **ou**
     URL externa. Campo "sessão" opcional (vazio = material geral da carta).
- **Server Actions** (`"use server"`) para todas as mutações, sempre após
  `requireAdmin()`, gravando em `audit_log` via `registrarAcao`. Uploads e
  exclusão de arquivos no Storage feitos no servidor.
- **Params async** (Next 16): `params` é Promise; usar `await params` nas páginas
  e passar `userId` para as actions via campo hidden do form.

## Segurança e consistência

- Todas as escritas passam por `requireAdmin()`; o admin usa o client comum
  (`@/lib/supabase/server`) — as policies admin (`is_admin()`) autorizam a
  gravação em linhas de qualquer `user_id`. O service-role só é usado para
  **listar e-mails** dos clientes.
- Excluir sessão/material remove o arquivo correspondente no Storage antes (ou
  depois) de apagar a linha; falha na remoção do arquivo não impede apagar a
  linha (log fica na auditoria).
- O que o admin grava é exatamente o que o cliente lê em `/app/cartografia`.

## Testes

- Lógica pura testável (Vitest): `parseTopicos` (texto multi-linha → `string[]`,
  ignorando linhas vazias) e `montarNomeArquivo` (nome único e seguro para
  Storage a partir de um arquivo enviado).
- CRUD/upload verificados por build + type-check + teste manual guiado.

## Fora de escopo (YAGNI aqui)

- CRUD de catálogo (produtos/eventos/cursos/ebooks) — próximo sub-projeto.
- Criação de depoimentos — próximo sub-projeto.
- Renderização da imagem da carta no lado do cliente (o `page.tsx` do cliente
  hoje não exibe `imagem_path`; guardamos o upload, exibir fica como follow-up).
- Reordenar sessões por drag-and-drop (usa-se o campo numérico `ordem`).

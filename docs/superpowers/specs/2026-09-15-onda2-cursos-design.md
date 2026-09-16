# Onda 2 — Cursos (admin CRUD + vitrine pública) — design

Data: 2026-09-15
Status: aprovado (aguarda revisão final do Iago)
Sub-projeto 4 (final) da Onda 2. Fecha a Onda 2 (Cartografia por cliente, catálogo e depoimentos já concluídos).

## Contexto

Cursos têm hierarquia: `courses` → `course_modules` → `course_lessons`
(cada aula com `youtube_id`). Hoje a vitrine `/cursos` lê do seed estático e não
há gestão no admin nem área de assistir. Este sub-projeto entrega a **gestão no
admin** (curso + módulos + aulas) e migra a **vitrine pública** para o banco.
**Assistir** na área logada + acesso por compra ficam para a Onda 4 (entrega),
onde o encaixe curso↔produto↔pagamento é desenhado junto.

## Decisões (validadas com o Iago)

1. **Escopo:** admin CRUD (curso/módulos/aulas) + vitrine pública lendo do banco.
   Player do cliente e gating por compra ficam para a Onda 4.
2. **Vídeo:** cada aula guarda `youtube_id`; no form o admin cola a **URL do
   YouTube** e o id é extraído pelo helper `youtubeId` (já existe, testado).
3. **Vitrine sem contagem de aulas:** as aulas são protegidas por RLS (só
   comprador/admin leem), então não dá para contar anonimamente. A vitrine mostra
   título, descrição, preço e capa. (Contador desnormalizado é follow-up opcional.)
4. **Exclusão:** toggle `ativo` + excluir de vez (remove capa do Storage e apaga
   módulos/aulas do curso).

## Estado do banco (confirmado)

- `courses(id, slug, titulo, descricao, preco, capa_path, ativo, created_at)`.
- `course_modules(id, course_id, titulo, ordem)`.
- `course_lessons(id, course_id, module_id, titulo, youtube_id, ordem)`.
- RLS (já existente, **sem migração**):
  - courses: `courses adm` (ALL, is_admin) + `courses pub` (SELECT `ativo OR is_admin()`).
  - course_modules: `modules adm` (ALL) + `modules pub` (SELECT, exige logado).
  - course_lessons: `lessons adm` (ALL) + `lessons entitlement` (SELECT: admin OU
    quem tem o produto do curso — `p.tipo='curso' AND p.slug=c.slug`).
- Bucket `capas` (público) para a capa do curso.

Nenhuma migração de schema ou de RLS é necessária.

## Arquitetura

- **`/admin/cursos`** — lista + criar/editar/ativar-desativar/excluir. Campos:
  título, slug (auto do título ao criar, manual ao editar), descrição, preço,
  capa (upload → `capas`), ativo. Excluir: apaga `course_lessons` e
  `course_modules` do curso, remove a capa e apaga o `courses`.
- **`/admin/cursos/[id]`** — estrutura do curso:
  - **Módulos:** form "novo módulo" + lista; cada módulo editável (`<details>`)
    e com excluir (excluir módulo apaga também suas aulas).
  - **Aulas:** dentro de cada módulo, form "nova aula" + lista; cada aula
    editável e com excluir. Campo de vídeo é a **URL do YouTube** → `youtube_id`
    via `youtubeId()`; URL inválida retorna erro.
- **`/cursos` (público):** lista `courses` ativos do banco (título, descrição,
  preço, capa via URL pública). Botão "Comprar" → `/contato` (por ora).
- **Menu:** item "Cursos" no `AdminShell`.
- **Server Actions** após `requireAdmin()`, com auditoria; upload/remoção de capa
  no servidor. `params` async (Next 16).

## Testes

- Reuso do `youtubeId` (já testado). Sem nova lógica pura relevante.
- CRUD/upload/hierarquia verificados por build + type-check + teste manual.

## Fora de escopo (Onda 4 / entrega)

- Assistir o curso na área logada (`/app/cursos`) e o controle de acesso por
  compra (o RLS de `lessons entitlement` já está pronto para isso).
- Contador de aulas na vitrine (exigiria desnormalização).
- Aulas fora de módulo (toda aula pertence a um módulo).

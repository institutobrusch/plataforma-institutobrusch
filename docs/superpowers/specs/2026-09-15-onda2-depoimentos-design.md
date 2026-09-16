# Onda 2 — Depoimentos (admin + público) — design

Data: 2026-09-15
Status: aprovado (aguarda revisão final do Iago)
Sub-projeto 3 da Onda 2 (1º Cartografia por cliente e 2º CRUD de catálogo já concluídos; cursos ficam para um sub-projeto à parte).

## Contexto

Os depoimentos hoje: a página pública `/depoimentos` (e a home) lê do **seed
estático** (`src/content`), e o `TestimonialCard` mostra **só texto**. A tabela
`testimonials` já existe no Supabase (com 7 depoimentos semeados na Etapa 2) e,
desde a Onda 1, tem `status`, `tipo`, `media_path`, `video_url`, `enviado_por`.
A moderação de depoimentos enviados já existe em `/admin/moderacao`. Falta: o
admin **criar/editar/excluir** depoimentos de 4 tipos, e o site **exibir** esses
tipos lendo do banco.

## Decisões (validadas com o Iago)

1. **Escopo público:** migrar `/depoimentos` (e os 3 destaques da home) para ler
   do Supabase (`status='aprovado'`) e renderizar os 4 tipos: texto, imagem,
   áudio (player), vídeo (embed YouTube).
2. **Mídia:** imagem e áudio no bucket **público `capas`** (URL pública direta,
   sem signed URL); vídeo é sempre **link do YouTube** (`video_url`).
3. **Sem migração de schema** (colunas já existem). **Uma** migração de RLS:
   restringir a leitura pública de `testimonials` a `status='aprovado' OR
   is_admin()` (hoje está `true`, expõe pendentes/recusados).

## Estado do banco (confirmado)

- `testimonials(id, nome, iniciais, contexto, texto, ordem, status, tipo,
  media_path, video_url, enviado_por, ...)`.
- RLS atual: `depo adm` (ALL, `is_admin()`), `depo pub` (SELECT, `true`).
- Bucket `capas` (público).

### Migração (RLS)
```sql
drop policy if exists "depo pub" on public.testimonials;
create policy "depo pub" on public.testimonials
  for select using (status = 'aprovado' or public.is_admin());
```

## Arquitetura

- **Admin `/admin/depoimentos`** — lista todos + criar/editar/excluir. Campos:
  nome, iniciais, contexto, `tipo` (texto/imagem/audio/video), texto, mídia
  (upload imagem **ou** áudio → `capas`) **ou** `video_url` (YouTube), `ordem`,
  `status` (padrão `aprovado` ao criar). Excluir remove o arquivo no Storage.
- Item **"Depoimentos"** adicionado ao menu do `AdminShell`.
- **Público:** `/depoimentos` e os destaques da home passam a buscar do Supabase
  (`status='aprovado'`, ordem asc). `TestimonialCard` reescrito para renderizar
  por tipo. Imagem/áudio via `storage.from('capas').getPublicUrl(path)`; vídeo
  via id extraído da URL (`youtubeId`, helper puro testado).
- **Server Actions** após `requireAdmin()`, com auditoria. Upload/exclusão de
  arquivo no servidor.

## Renderização por tipo (TestimonialCard)

- **texto:** citação (layout atual).
- **imagem:** `<img>` (URL pública) + nome/contexto.
- **áudio:** `<audio controls>` + nome/contexto.
- **vídeo:** iframe do YouTube (16:9) + nome/contexto.
- iniciais: usar o campo; se vazio, derivar do nome.

## Testes

- `youtubeId(url)` (puro, Vitest): aceita `watch?v=`, `youtu.be/`, `embed/`,
  ignora lixo → retorna id ou `null`.
- CRUD/upload e render por tipo: build + type-check + teste manual guiado.

## Fora de escopo (YAGNI aqui)

- Formulário do **cliente** enviar depoimento (moderação já existe; tela de envio
  fica para depois).
- Cursos (sub-projeto próprio).
- Remoção do seed `DEPOIMENTOS` de `src/content` (fica no código sem uso; pode
  ser limpo depois — não quebra nada).

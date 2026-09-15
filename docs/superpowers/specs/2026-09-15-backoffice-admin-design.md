# Backoffice Admin — Instituto Brusch (design)

Data: 2026-09-15
Status: aprovado (aguarda revisão final do Iago)

## Contexto

A plataforma já tem site público, autenticação real (Supabase) e área logada
(`/app`: Pensamento diário, Comunidade, Cartografia) lendo do banco. Falta a
**área administrativa** onde a Camila (e o Iago) gerenciam a plataforma.

Este documento descreve o backoffice **completo** (todas as ondas). A Onda 1 é a
que será construída em seguida; as demais ficam registradas para planejamento.

## Decisões (validadas com o Iago)

1. **Admins:** Camila + Iago com acesso total (`admin`). Modelo de permissões
   **baseado em papéis e extensível** desde já, para futuramente plugar
   `moderador`, `colunista` etc. sem refazer o banco.
2. **Mídia:** áudio, PDF e imagem no **Supabase Storage** (privado, signed URL);
   **vídeo** (cursos e depoimentos) via **link YouTube/Vimeo não listado**.
3. **Edição do site público:** apenas um bloco fixo de **Configurações**
   (logo, favicon, e-mail oficial, WhatsApp/telefone, textos do hero, bio da
   Camila, redes sociais). Sem CMS aberto.
4. **Vendas/pagamento (antes do Asaas):** conceder/remover acesso a produto
   manualmente + registrar **venda manual** simples (histórico). Sem gateway.
5. **Pensamento diário:** publicação **na hora** e **agendada** (data de
   publicação + rascunho). Sem cron — visível quando `status=publicado` e
   `data <= hoje`.
6. **Onboarding de cliente novo:** **convite por link/e-mail** — admin cria
   convite (escolhe produto), cliente abre o link, define a própria senha ou
   entra com Google e já recebe o produto.
7. **Log de auditoria:** incluído já na **Onda 1** (dado sensível de saúde
   mental — LGPD desde o início).

## Arquitetura

- **Rota `/admin`** dentro do mesmo app Next (não é projeto separado), como um
  route group próprio com layout e sidebar de administração — mesma abordagem de
  `(site)` e `/app`.
- **Guarda no servidor:** `requireAdmin()` (análogo a `requireUser()` em
  `src/lib/auth.ts`) que busca o perfil e redireciona quem não for admin. A
  `Proxy` (`src/proxy.ts`) inclui `/admin` na renovação de sessão.
- **Permissões por papel:** helper no banco e no app. Hoje só `admin` tem
  acesso; a estrutura já permite checagem por área para papéis futuros.
- **Server Actions** para todas as mutações (upload, moderação, concessão de
  acesso, convites), com re-checagem de `is_admin()` no servidor — nunca confiar
  só na UI.

## Modelo de dados (mudanças — todas aditivas, não destrutivas)

Schema atual relevante (confirmado em `src/lib/database.types.ts`):
- `profiles(id, nome, papel, created_at)` — `papel` default `member`.
- `daily_thoughts(id, data, titulo, texto, audio_path, publicado_por, created_at)`.
- `testimonials(id, nome, iniciais, contexto, texto, ordem)`.
- `invites(id, email, token, product_id, status, expira_em, criado_por, created_at)`.
- `user_products(id, user_id, product_id, origem, status, created_at)`.
- `suggestions(id, texto, user_id, status, created_at)`.
- Funções: `is_admin()`, `has_product(slug)`.

### Migrações da Onda 1

1. **Papéis extensíveis**
   - Manter `profiles.papel` como texto, com valores previstos:
     `member | admin | moderador | colunista`.
   - `is_admin()` permanece (`papel = 'admin'`).
   - Nenhuma coluna nova obrigatória agora; a extensibilidade é convenção +
     helpers futuros (`has_role(role)` fica para a onda de papéis).

2. **`daily_thoughts` — agendamento**
   - Adicionar `status text not null default 'publicado'`
     (`rascunho | publicado`).
   - Usar a coluna existente `data` como data de publicação.
   - Leitura pública (área logada): `status='publicado' AND data <= current_date`,
     ordenado por `data desc`. Admin vê tudo.

3. **`testimonials` — moderação e mídia**
   - Adicionar `status text not null default 'aprovado'`
     (`pendente | aprovado | recusado`).
   - Adicionar `tipo text not null default 'texto'`
     (`texto | imagem | audio | video`).
   - Adicionar `media_path text` (Storage: imagem/áudio) e `video_url text`
     (YouTube/Vimeo).
   - Adicionar `enviado_por uuid references auth.users` (null = criado pelo admin).
   - Site público mostra só `status='aprovado'`.

4. **`sales` (nova)** — venda manual / histórico
   - `id, user_id (fk auth.users), product_id (fk products), valor numeric,
     data date, origem text default 'manual', observacao text, criado_por uuid,
     created_at`.
   - Sem status de pagamento nesta fase (entra na onda do Asaas).

5. **`audit_log` (nova)** — LGPD/auditoria
   - `id, actor uuid (quem fez), acao text (ex.: 'grant_product',
     'moderate_post', 'publish_thought'), entidade text, entidade_id text,
     detalhe jsonb, created_at`.
   - Escrito pelas Server Actions do admin. Leitura só admin.

6. **RLS** em todas as tabelas novas: admin (via `is_admin()`) lê/escreve;
   `audit_log` e `sales` sem acesso para não-admin. As colunas novas em tabelas
   existentes seguem as policies já existentes (admin gerencia; público lê o que
   for aprovado/publicado).

### Storage

- Buckets já existentes: `audios`, `materiais`, `ebooks`, `cartas` (privados),
  `capas` (público). Depoimentos em áudio/imagem usam `audios`/`capas` conforme
  o tipo (ou um bucket `depoimentos` novo, a decidir no plano).

## Onda 1 — funcionalidades a construir

1. **Base do admin**: route group `/admin`, layout + sidebar, `requireAdmin()`,
   inclusão na Proxy.
2. **Dashboard**: cartões com membros ativos, vendas do mês, posts pendentes,
   depoimentos/sugestões pendentes + atalhos para cada fila.
3. **Pensamento diário**: upload de áudio (Storage), título/texto, data,
   publicar agora ou agendar, listar/editar/excluir, ver rascunhos.
4. **Moderação unificada**: abas Comunidade (posts/comentários), Depoimentos
   enviados, Sugestões — aprovar / recusar / responder.
5. **Acesso a produtos**: buscar usuário, conceder/remover produto, com opção de
   registrar venda manual no mesmo fluxo.
6. **Convites**: criar convite (produto + e-mail) → link; resgate em
   `/convite/[token]` cria a conta do cliente e concede o produto.
7. **Auditoria**: toda ação admin acima grava em `audit_log`; tela simples de
   listagem (somente leitura).

## Ondas seguintes (não construídas agora)

- **Onda 2:** CRUD de produtos/eventos/cursos/e-books; Cartografia **por
  cliente** (carta/sessões/materiais individuais); criação de depoimentos.
- **Onda 3:** Configurações da plataforma (`site_settings`: logo, favicon,
  contatos, hero, bio, redes) + Blog (papel colunista).
- **Onda 4:** Vendas/financeiro completo + Asaas (checkout/webhook) +
  notificações/e-mail transacional.
- **Onda 5:** Métricas de engajamento, papéis extras (moderador/colunista com
  acesso por área), exportar/excluir dados do titular (LGPD).

## Pré-requisitos (dependem do Iago)

- `SUPABASE_SERVICE_ROLE_KEY` em `platform/.env.local` — necessário para o
  resgate de convite (criação da conta do cliente via admin API). Sem ela, todo
  o resto da Onda 1 é construível; só o resgate ponta a ponta fica pendente.
- No painel do Supabase: desligar signup público e configurar provider Google
  (para o login social; não bloqueia a construção).

## Fora de escopo (YAGNI nesta fase)

- Gateway de pagamento / cobrança automática (Asaas) — Onda 4.
- CMS aberto para todo o site — decidido não fazer.
- Hospedar vídeo como arquivo próprio — usar YouTube/Vimeo.
- Papéis com acesso parcial em produção — estrutura pronta, ativação na Onda 5.

## Testes

- Lógica pura testável com Vitest: filtro de visibilidade do Pensamento diário
  (`status`/`data`), montagem da fila de moderação, validações de convite.
- Guardas de servidor (`requireAdmin`) verificadas por teste de redirecionamento
  quando possível.

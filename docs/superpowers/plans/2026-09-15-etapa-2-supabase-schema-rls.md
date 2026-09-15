# Etapa 2 — Supabase (schema + RLS + storage) — Plano

> **Pré-requisito bloqueante:** o conector Supabase do Claude precisa estar autenticado na conta **institutobrusch**, com acesso ao projeto **`jnwjrjzinqqcxlvleznq`**. Hoje ele está em outra conta (vê só `cronograma-perfeito`) e recebe "permission denied" no projeto-alvo. Nada abaixo é executado até isso ser resolvido e confirmado.

**Goal:** Criar o banco real (Postgres/Supabase) com isolamento por usuário (RLS) e os buckets de storage, para sustentar a área logada e as vendas — sem ainda ligar auth no front (isso é a Etapa 3).

**Projeto:** `jnwjrjzinqqcxlvleznq` (institutobrusch, região us-east-1).

**Como será aplicado:** via `apply_migration` (uma migração por bloco lógico), revisando os *advisors* de segurança do Supabase ao final. Cada migração abaixo é um passo aprovável.

---

## Convenções
- Todas as tabelas em `public`, com `id uuid default gen_random_uuid() primary key` (salvo ponte com `auth.users`), `created_at timestamptz default now()`.
- **RLS habilitado em todas as tabelas.** Sem policy = sem acesso.
- Papéis: `member` (padrão) e `admin` (Camila/equipe). Checagem via função `is_admin()` **SECURITY DEFINER** (evita recursão de RLS em `profiles`).
- Conteúdo pago só é lido com *entitlement* ativo em `user_products` (função `has_product(slug)`).
- Nunca usar `service_role` no front. Chaves: `NEXT_PUBLIC_SUPABASE_URL` e a **publishable/anon key** (públicas); `service_role` só em rotas de servidor (Etapa 3/4), guardada em secret.

---

## Migração 1 — Base: perfis + helpers
```sql
-- Perfis (1:1 com auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  papel text not null default 'member' check (papel in ('member','admin')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- Cria o profile automaticamente no signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nome) values (new.id, new.raw_user_meta_data->>'name');
  return new;
end; $$;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- Helper de admin (SECURITY DEFINER = ignora RLS ao checar)
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and papel = 'admin');
$$;

-- Policies de profiles
create policy "perfil próprio: ler" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "perfil próprio: atualizar" on public.profiles for update using (id = auth.uid());
create policy "admin gerencia perfis" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
```

## Migração 2 — Produtos, entitlements e convites
```sql
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  tipo text not null check (tipo in ('cartografia','curso','ebook','evento')),
  nome text not null, preco numeric not null default 0, ativo boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.user_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  status text not null default 'ativo' check (status in ('ativo','cancelado','pendente')),
  origem text not null default 'admin' check (origem in ('admin','asaas','convite')),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
create table public.invites (
  id uuid primary key default gen_random_uuid(),
  email text not null, token text unique not null,
  product_id uuid references public.products(id) on delete set null,
  status text not null default 'pendente' check (status in ('pendente','usado','expirado')),
  criado_por uuid references auth.users(id), expira_em timestamptz,
  created_at timestamptz not null default now()
);
alter table public.products enable row level security;
alter table public.user_products enable row level security;
alter table public.invites enable row level security;

-- Helper de entitlement
create or replace function public.has_product(p_slug text)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.user_products up
    join public.products p on p.id = up.product_id
    where up.user_id = auth.uid() and up.status = 'ativo' and p.slug = p_slug
  );
$$;

create policy "produtos: leitura pública dos ativos" on public.products for select using (ativo or public.is_admin());
create policy "produtos: admin escreve" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "meus acessos: ler" on public.user_products for select using (user_id = auth.uid() or public.is_admin());
create policy "acessos: admin gerencia" on public.user_products for all using (public.is_admin()) with check (public.is_admin());
create policy "convites: admin" on public.invites for all using (public.is_admin()) with check (public.is_admin());
```

## Migração 3 — Comunidade (com moderação prévia)
```sql
create table public.community_groups (
  id uuid primary key default gen_random_uuid(), slug text unique not null, nome text not null,
  ativo boolean not null default true, created_at timestamptz not null default now()
);
create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.community_groups(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  texto text not null check (char_length(texto) between 1 and 2000),
  status text not null default 'pendente' check (status in ('pendente','aprovado','rejeitado')),
  created_at timestamptz not null default now()
);
create table public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  texto text not null check (char_length(texto) between 1 and 2000),
  status text not null default 'pendente' check (status in ('pendente','aprovado','rejeitado')),
  created_at timestamptz not null default now()
);
create table public.community_likes (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (post_id, user_id)
);
alter table public.community_groups enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_likes enable row level security;

create policy "grupos: membros leem" on public.community_groups for select using (auth.uid() is not null);
create policy "grupos: admin" on public.community_groups for all using (public.is_admin()) with check (public.is_admin());

-- Posts: vê aprovados, os próprios e (admin) todos; cria só como autor e sempre 'pendente'
create policy "posts: ler aprovados/próprios" on public.community_posts for select
  using (status = 'aprovado' or author_id = auth.uid() or public.is_admin());
create policy "posts: criar" on public.community_posts for insert
  with check (author_id = auth.uid() and status = 'pendente');
create policy "posts: autor edita/remove" on public.community_posts for update using (author_id = auth.uid());
create policy "posts: admin modera" on public.community_posts for all using (public.is_admin()) with check (public.is_admin());

create policy "comentários: ler aprovados/próprios" on public.community_comments for select
  using (status = 'aprovado' or author_id = auth.uid() or public.is_admin());
create policy "comentários: criar" on public.community_comments for insert
  with check (author_id = auth.uid() and status = 'pendente');
create policy "comentários: admin modera" on public.community_comments for all using (public.is_admin()) with check (public.is_admin());

create policy "likes: ler" on public.community_likes for select using (auth.uid() is not null);
create policy "likes: gerenciar os próprios" on public.community_likes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
```

## Migração 4 — Cartografia (por usuário) + Pensamento diário
```sql
create table public.carto_cartas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null, imagem_path text, explicacao text, topicos text[] default '{}',
  created_at timestamptz not null default now()
);
create table public.carto_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null, data date, duracao text, audio_path text, resumo text, ordem int default 0,
  created_at timestamptz not null default now()
);
create table public.carto_materials (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.carto_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null, arquivo_path text, url text, tipo text,
  created_at timestamptz not null default now()
);
create table public.daily_thoughts (
  id uuid primary key default gen_random_uuid(),
  data date not null default current_date, titulo text not null, audio_path text, texto text,
  publicado_por uuid references auth.users(id), created_at timestamptz not null default now()
);
alter table public.carto_cartas enable row level security;
alter table public.carto_sessions enable row level security;
alter table public.carto_materials enable row level security;
alter table public.daily_thoughts enable row level security;

-- Cartografia: cada usuário só vê o que é seu (e precisa ter o produto); admin gerencia tudo
create policy "carta própria" on public.carto_cartas for select using (user_id = auth.uid() and public.has_product('cartografia') or public.is_admin());
create policy "carta admin" on public.carto_cartas for all using (public.is_admin()) with check (public.is_admin());
create policy "sessões próprias" on public.carto_sessions for select using (user_id = auth.uid() and public.has_product('cartografia') or public.is_admin());
create policy "sessões admin" on public.carto_sessions for all using (public.is_admin()) with check (public.is_admin());
create policy "materiais próprios" on public.carto_materials for select using (user_id = auth.uid() and public.has_product('cartografia') or public.is_admin());
create policy "materiais admin" on public.carto_materials for all using (public.is_admin()) with check (public.is_admin());

-- Pensamento diário: todo membro logado lê; admin publica
create policy "pensamento: membros leem" on public.daily_thoughts for select using (auth.uid() is not null);
create policy "pensamento: admin publica" on public.daily_thoughts for all using (public.is_admin()) with check (public.is_admin());
```

## Migração 5 — Catálogo público (site) + cursos/ebooks
```sql
create table public.events (id uuid primary key default gen_random_uuid(), slug text unique not null, titulo text not null, tipo text check (tipo in ('Presencial','Online')), data text, local text, preco numeric default 0, vagas text, descricao text, poster_path text, ativo boolean default true, created_at timestamptz default now());
create table public.blog_posts (id uuid primary key default gen_random_uuid(), slug text unique not null, titulo text not null, autor text, cargo text, data text, resumo text, corpo text[], imagem_path text, publicado boolean default true, created_at timestamptz default now());
create table public.testimonials (id uuid primary key default gen_random_uuid(), nome text, contexto text, texto text, iniciais text, ordem int default 0);
create table public.faq_items (id uuid primary key default gen_random_uuid(), pergunta text, resposta text, ordem int default 0, ativo boolean default true);
create table public.ebooks (id uuid primary key default gen_random_uuid(), slug text unique not null, titulo text not null, descricao text, capa_path text, arquivo_path text, preco numeric default 0, ativo boolean default true, created_at timestamptz default now());
create table public.courses (id uuid primary key default gen_random_uuid(), slug text unique not null, titulo text not null, descricao text, capa_path text, preco numeric default 0, ativo boolean default true, created_at timestamptz default now());
create table public.course_modules (id uuid primary key default gen_random_uuid(), course_id uuid references public.courses(id) on delete cascade, titulo text, ordem int default 0);
create table public.course_lessons (id uuid primary key default gen_random_uuid(), module_id uuid references public.course_modules(id) on delete cascade, course_id uuid references public.courses(id) on delete cascade, titulo text, youtube_id text, ordem int default 0);
-- habilita RLS em todas
alter table public.events enable row level security; alter table public.blog_posts enable row level security; alter table public.testimonials enable row level security; alter table public.faq_items enable row level security; alter table public.ebooks enable row level security; alter table public.courses enable row level security; alter table public.course_modules enable row level security; alter table public.course_lessons enable row level security;

-- Leitura pública dos itens ativos/publicados; escrita só admin
create policy "events pub" on public.events for select using (ativo or public.is_admin());
create policy "events adm" on public.events for all using (public.is_admin()) with check (public.is_admin());
create policy "blog pub" on public.blog_posts for select using (publicado or public.is_admin());
create policy "blog adm" on public.blog_posts for all using (public.is_admin()) with check (public.is_admin());
create policy "depo pub" on public.testimonials for select using (true);
create policy "depo adm" on public.testimonials for all using (public.is_admin()) with check (public.is_admin());
create policy "faq pub" on public.faq_items for select using (ativo or public.is_admin());
create policy "faq adm" on public.faq_items for all using (public.is_admin()) with check (public.is_admin());
create policy "ebooks pub" on public.ebooks for select using (ativo or public.is_admin());
create policy "ebooks adm" on public.ebooks for all using (public.is_admin()) with check (public.is_admin());
create policy "courses pub" on public.courses for select using (ativo or public.is_admin());
create policy "courses adm" on public.courses for all using (public.is_admin()) with check (public.is_admin());
create policy "modules pub" on public.course_modules for select using (auth.uid() is not null);
create policy "modules adm" on public.course_modules for all using (public.is_admin()) with check (public.is_admin());
-- Aulas (conteúdo) só com entitlement do curso ou admin
create policy "lessons entitlement" on public.course_lessons for select using (
  public.is_admin() or exists (
    select 1 from public.user_products up join public.products p on p.id = up.product_id
    join public.courses c on c.id = course_lessons.course_id
    where up.user_id = auth.uid() and up.status='ativo' and p.tipo='curso' and p.slug = c.slug
  )
);
create policy "lessons adm" on public.course_lessons for all using (public.is_admin()) with check (public.is_admin());
```

## Migração 6 — Sugestões + inscrições em eventos
```sql
create table public.suggestions (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null, texto text not null, status text default 'novo', created_at timestamptz default now());
create table public.event_registrations (id uuid primary key default gen_random_uuid(), event_id uuid references public.events(id) on delete cascade, user_id uuid references auth.users(id) on delete cascade, status text default 'inscrito', pagamento_ref text, created_at timestamptz default now(), unique(event_id, user_id));
alter table public.suggestions enable row level security; alter table public.event_registrations enable row level security;
create policy "sug: criar" on public.suggestions for insert with check (user_id = auth.uid() or user_id is null);
create policy "sug: ler próprias/admin" on public.suggestions for select using (user_id = auth.uid() or public.is_admin());
create policy "sug: admin" on public.suggestions for all using (public.is_admin()) with check (public.is_admin());
create policy "insc: próprias" on public.event_registrations for select using (user_id = auth.uid() or public.is_admin());
create policy "insc: criar" on public.event_registrations for insert with check (user_id = auth.uid());
create policy "insc: admin" on public.event_registrations for all using (public.is_admin()) with check (public.is_admin());
```

## Migração 7 — Storage (buckets privados)
- Buckets **privados**: `audios` (pensamento + sessões), `materiais`, `ebooks`, `cartas`. Bucket `capas` **público** (capas de curso/ebook/poster de evento).
- Acesso a arquivos privados **sempre via URL assinada** gerada no servidor após checar entitlement (Etapa 3/4). Policies em `storage.objects`: leitura só admin (por enquanto) + escrita admin; a leitura por membro será por signed URL server-side (service role) após validação, então não abrimos leitura ampla no bucket.
```sql
insert into storage.buckets (id, name, public) values
  ('audios','audios',false),('materiais','materiais',false),
  ('ebooks','ebooks',false),('cartas','cartas',false),('capas','capas',true)
on conflict do nothing;
create policy "capas leitura pública" on storage.objects for select using (bucket_id = 'capas');
create policy "admin escreve storage" on storage.objects for all
  using (public.is_admin()) with check (public.is_admin());
```

## Passo 8 — Seed inicial
- Inserir `products`: `cartografia` (tipo cartografia), os 3 cursos e 3 e-books (slugs iguais aos do seed atual), e produtos de evento conforme necessário.
- Inserir o catálogo atual (events, blog_posts, testimonials, faq_items, ebooks, courses) a partir do seed em `src/content/` — via `write` de linhas (não hardcode no front).
- Criar 1 grupo `community_groups` "geral".
- Marcar 1 usuário como `admin` (a Camila) depois que ela criar a conta.

## Passo 9 — Tipos + client no app (código, local)
- `generate_typescript_types` → salvar em `src/lib/database.types.ts`.
- Criar `src/lib/supabase/client.ts` (browser) e `server.ts` (server) com `@supabase/ssr`.
- Adicionar `.env.local` (gitignored) com `NEXT_PUBLIC_SUPABASE_URL` e a anon key; as mesmas vars vão na Vercel na Etapa 6.
- **Ainda não** trocar o front para ler do Supabase — isso é a Etapa 3 (auth) e 4 (dados). Etapa 2 entrega o banco pronto e verificado.

## Passo 10 — Verificação
- Rodar `get_advisors` (security + performance) e corrigir o que aparecer (ex.: policy faltando, função sem search_path).
- Conferir que RLS está ON em todas as tabelas e que um usuário anônimo só lê o catálogo público.

---

## Ordem de execução (cada uma aprovável)
1. Reconectar Supabase à conta institutobrusch ✅ (você) → eu confirmo acesso a `jnwjrjzinqqcxlvleznq`.
2. Migrações 1→7 (uma a uma).
3. Seed (passo 8).
4. Tipos + client no app (passo 9, local).
5. Advisors + verificação (passo 10).
6. `git push` para `origin` (institutobrusch) — após você confirmar o login do GitHub no PC.

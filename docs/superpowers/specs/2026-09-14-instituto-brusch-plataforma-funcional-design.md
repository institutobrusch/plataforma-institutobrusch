# Instituto Brusch — Plataforma funcional (produto real)

**Data:** 2026-09-14
**Status:** Rascunho para revisão do Iago
**Autor:** Iago Silvino + Claude
**Substitui a fase de:** demo navegável (`web/index.html`) — aprovada pela cliente Camila Brusch

> Regra de ouro deste projeto: **nenhuma alteração, commit ou configuração em GitHub, Supabase ou Vercel sem autorização explícita do Iago.** Enquanto não autorizado, todo trabalho é local.

---

## 1. Objetivo

Transformar o MVP/protótipo aprovado (SPA single-file, dados mock, fluxos simulados) em um **produto funcional real**: site institucional público + **plataforma de membros** com login, produtos comprados (Cartografia e futuros), conteúdo por usuário (áudios, materiais, cartas), comunidade e vendas.

A aparência e a estrutura visual **já foram aprovadas** pela cliente. Esta fase: (a) adequa a **marca** (paleta + logo + tipografia), (b) **reestrutura a área logada** para múltiplos produtos, (c) **adiciona páginas novas**, e (d) coloca **backend real** por trás de tudo.

## 2. Princípio de proporcionalidade (do manual)

Este é um SaaS multiusuário com dados pessoais (saúde/autoconhecimento), conteúdo pago por usuário e pagamentos — portanto **exige** autenticação real, isolamento por usuário e segurança básica obrigatória. Isso **não** é overengineering: é proporcional ao dado que guarda. O que escala com o tempo (E2E extenso, testes de carga, observabilidade avançada) fica para fases posteriores.

---

## 3. Escopo

### 3.1 Rebrand (Bloco A) — só paleta, logo e tipografia
A cliente aprovou o layout; mudamos apenas identidade visual, conforme `Identidade visual da marca.pdf`.

**Paleta (hex reais extraídos do manual — os hex escritos no PDF estavam trocados):**

| Token | Papel | Claro | Escuro (derivado) |
|---|---|---|---|
| `--navy` | primária (botões, títulos) | `#2D3951` | `#8FA0BE` |
| `--navy-d` | primária escura (faixas, CTA, sidebar) | `#1F2839` | `#7C8DAC` |
| `--navy-l` | — | `#5A6B85` | `#A9B6CC` |
| `--tan` | acento/eyebrows | `#B0977F` | `#C6AD93` |
| `--gold` | dourado de destaque | `#9C7E5E` | `#C6A374` |
| `--tan-bg` | fundo suave (chips, pills) | `#EFEAE3` | `#2A2E36` |
| `--bg` | fundo | `#FAF9F6` | `#181A1F` |
| `--surface` | cards | `#FFFFFF` | `#20232A` |
| `--line` | bordas | `#E4E1D9` | `#33363E` |
| `--ink` / `--ink-2` / `--ink-3` | texto | `#1B2230` / `#4C536044` (ver impl.) | claro |

- O **dourado deixa de ser exclusivo da Cartografia** e passa a ser o acento da marca em toda a plataforma.
- Mantêm-se os mesmos papéis de token que o design atual usa, para trocar cor sem redesenhar.

**Tipografia:** adotar **Poppins** (fonte secundária da marca) como fonte de uso geral (títulos + corpo), via Google Fonts. A fonte "principal" do manual é exclusiva da logomarca — usada só na logo, não na UI. As fontes antigas (Libre Franklin / Newsreader) saem.

**Logomarca:** usar a logo oficial "Instituto Brusch" (monograma B). Versões: dourada sobre marinho, marinho sobre claro. Fonte do asset: extrair PNG/SVG de alta resolução do PDF do manual; **ideal** obter o vetor original (.AI/.SVG) do designer. Aplicar no header, footer, favicon e tela de login.

### 3.2 Área logada → "Acessar a plataforma" (Bloco B)
- Renomear a entrada "Área do cliente" para **"Acessar a plataforma"**.
- A plataforma é **multi-produto**: vários produtos dão acesso; o menu lateral mostra **apenas os produtos que o usuário comprou**.
- **Página inicial da plataforma = "Pensamento diário":** áudio diário publicado pela Camila para a comunidade (player + data + eventual texto de apoio). Mostra o do dia + histórico.
- **Comunidade** (para todos os membros): mural estilo Twitter — membros publicam textos curtos; outros podem **curtir** e **comentar**. Ordenação por mais recentes.
- **Menu lateral** lista os produtos do usuário. Para quem tem **Cartografia**, aparece a seção Cartografia com:
  - **Minha carta** (imagem + explicação dos campos + tópicos),
  - **Sessões** (lista com áudio + resumo),
  - **Materiais** (novo) — arquivos/links referentes a cada sessão, quando houver,
  - **(Remover "Recomendação do mês")** — não será usada.

### 3.3 Novas páginas (Bloco C)
- **E-books** — página pública de venda (catálogo + detalhe + compra); entrega do arquivo ao comprador na plataforma.
- **Cursos** — página pública de venda (catálogo + detalhe + compra); curso acessível na área logada (aulas/módulos).
- **Perguntas frequentes (FAQ)** — página pública com perguntas/respostas (acordeão), gerenciável pela Camila.
- **Sugestões** — área onde o usuário envia sugestões (formulário autenticado; ficam registradas para a Camila ver no admin).

### 3.4 Painel administrativo (Camila) — necessário
Para o produto ser funcional, a Camila precisa **publicar e gerenciar** sem depender de dev:
- Publicar o **Pensamento diário** (upload de áudio + texto).
- Gerenciar **Cartografia** por cliente: carta, sessões (áudio + resumo), materiais.
- CRUD de **Eventos**, **Blog**, **E-books**, **Cursos**, **FAQ**, **Depoimentos**.
- Ver **Sugestões** recebidas e **moderar** a Comunidade (remover post/comentário).
- Ver/atribuir **acessos a produtos** dos usuários (quem comprou o quê).

### 3.5 Fora de escopo (fases posteriores)
- App mobile nativo; internacionalização; automações de marketing/e-mail avançadas; relatórios/BI; testes E2E extensos e testes de carga; SSO/social login (a decidir).

---

## 4. Arquitetura técnica

**Stack (aprovada):** Next.js (App Router, TypeScript) + Supabase (Auth, Postgres, Storage) + Vercel (deploy). Tailwind CSS + tokens da marca como CSS variables.

**Camadas:**
- **Público (SSR/SSG):** páginas institucionais e de venda (melhor SEO). Rotas: `/`, `/instituto`, `/camila`, `/eventos`, `/eventos/[id]`, `/blog`, `/blog/[id]`, `/depoimentos`, `/comunidade` (institucional), `/cartografia` (landing), `/ebooks`, `/ebooks/[id]`, `/cursos`, `/cursos/[id]`, `/faq`, `/contato`.
- **Plataforma (autenticada):** `/app` (Pensamento diário), `/app/comunidade`, `/app/cartografia` (carta/sessões/materiais), `/app/cursos/[id]` (player do curso), `/app/ebooks` (biblioteca), `/app/sugestoes`.
- **Admin:** `/admin/*` (restrito a papel `admin`).
- **Auth:** Supabase Auth (e-mail/senha; recuperação de senha sem enumeração de usuário). Sessão via cookies `HttpOnly`/`Secure`/`SameSite`.

**Isolamento (multi-tenant por usuário) — obrigatório:**
- **RLS ligado em todas as tabelas.** Toda leitura/escrita de conteúdo por usuário filtra por `auth.uid()`.
- Conteúdo pago só é acessível se houver **entitlement** (registro em `user_products`) ativo.
- Storage privado (áudios de sessão, materiais, e-books, vídeos de curso) servido via **URLs assinadas** com expiração — nunca links públicos diretos.
- Toda rota/handler que busca objeto por ID valida posse (evitar IDOR).

### 4.1 Modelo de dados (rascunho — Supabase/Postgres)
- `profiles` (id→auth.users, nome, papel: `member`|`admin`, criado_em)
- `invites` (id, email, token, product_id?, status: `pendente`|`usado`|`expirado`, criado_por, expira_em) — cadastro só por compra/convite (§7.2)
- `products` (id, slug, tipo: `cartografia`|`curso`|`ebook`, nome, preço, ativo)
- `user_products` (user_id, product_id, status, origem: `admin`|`asaas`|`convite`, criado_em) — **entitlements**
- `daily_thoughts` (id, data, audio_path, texto, publicado_por, criado_em) — Pensamento diário
- `community_groups` (id, slug, nome, ativo) — 1 grupo "geral" no início; preparado p/ grupos futuros (§7.5)
- `community_posts` (id, group_id, author_id, texto, status: `pendente`|`aprovado`|`rejeitado`, criado_em) — **moderação prévia**
- `community_comments` (id, post_id, author_id, texto, status: `pendente`|`aprovado`|`rejeitado`, criado_em)
- `community_likes` (post_id, user_id) — PK composta
- `carto_cartas` (id, user_id, titulo, imagem_path, explicacao, topicos[])
- `carto_sessions` (id, user_id, titulo, data, duracao, audio_path, resumo, ordem)
- `carto_materials` (id, session_id, user_id, titulo, arquivo_path|url, tipo)
- `courses` (id, slug, titulo, descricao, capa_path, preço, ativo) + `course_modules` + `course_lessons` (youtube_id, ordem) — vídeo no YouTube não-listado (§7.3)
- `ebooks` (id, slug, titulo, descricao, capa_path, arquivo_path, preço, ativo) — leitura na plataforma, sem download (§7.4)
- `events` (id, slug, titulo, tipo, data, local, preço, vagas, descricao, poster_path, ativo)
- `blog_posts` (id, slug, titulo, autor, cargo, data, resumo, corpo, imagem_path, publicado)
- `testimonials` (id, nome, contexto, texto, iniciais, ordem)
- `faq_items` (id, pergunta, resposta, ordem, ativo)
- `suggestions` (id, user_id, texto, criado_em, status)
- `event_registrations` (id, event_id, user_id, status, pagamento_ref)

> O modelo é ponto de partida; ajustes finos durante a construção (sem mudanças grandes de schema sem aprovação, conforme manual §1.2).

### 4.2 Pagamentos — gateway **Asaas** (integração adiada)
Gateway definido: **Asaas** (PIX/boleto/cartão). **Não será configurado agora.** O modelo de **entitlement** (`user_products`) é independente do gateway: o pagamento confirmado (via webhook do Asaas, futuramente) gera o acesso. Até lá, o acesso a produtos é concedido pelo **admin** (Camila) — e o código já é desenhado com a "costura" pronta para plugar o Asaas depois (checkout + webhook de confirmação) sem retrabalho de modelo.

---

## 5. Segurança, erros e observabilidade (do manual)
- Segredos só no gerenciador da Vercel/Supabase; nada de chave secreta com prefixo público; `.env*` no `.gitignore`.
- Autenticação/autorização validadas **no servidor**; senhas com hash do próprio Supabase (bcrypt); cookies seguros.
- Validação de entrada/saída em toda API; queries parametrizadas (Supabase já protege); uploads com restrição de tipo/tamanho.
- Security headers (CSP, HSTS, X-Frame-Options, etc.) e HTTPS forçado.
- Rate limiting nas rotas críticas (login, cadastro, recuperação, envio de sugestões/posts) — proporcional à exposição pública.
- Tratamento de erro padronizado: nunca tela branca/loading infinito; estados de erro visíveis; error boundaries.
- Logs úteis (nível, módulo, ação, user/tenant, request id) **sem** dados sensíveis.
- Nunca logar senha/token/dado pessoal sensível.

## 6. Testes (proporcional)
- TDD nos fluxos críticos: entitlements/acesso a conteúdo pago, isolamento por usuário (RLS), confirmação de pagamento→acesso, autenticação.
- Todo bug corrigido ganha teste de regressão.
- Suíte E2E ampla e testes de carga: fases posteriores.

---

## 7. Decisões (resolvidas com o Iago em 2026-09-14)
1. **Pagamentos:** gateway **Asaas**; **não configurar agora**. Acesso concedido via admin até a integração (ver §4.2).
2. **Cadastro:** conta criada **somente após compra ou convite** (não é cadastro aberto). Ter **login social Google** como opção, além de e-mail/senha.
3. **Cursos:** vídeos hospedados no **YouTube** (não-listado); o player embeda o vídeo na área logada, com acesso gated por entitlement. (Proteção do conteúdo é limitada pelo YouTube — aceito nesta fase.)
4. **E-books:** **leitura na plataforma** (visualizador embutido), **sem download**. O arquivo fica em Storage privado, servido por URL assinada só para quem tem acesso.
5. **Comunidade:** **uma só para todos** os membros no início, com **arquitetura preparada** para futuramente separar em grupos específicos. **Moderação prévia**: post/comentário só aparece após aprovação do admin (campo `status`: `pendente`/`aprovado`/`rejeitado`).
6. **Pensamento diário:** visível para **todos os membros logados**.
7. **Domínio/e-mail:** já existem, mas **não configurar agora** (recuperação de senha/e-mail transacional entram quando formos ligar o domínio).
8. **Conteúdo inicial:** **aproveitar** os textos/eventos/depoimentos do protótipo como seed, **editáveis no backoffice** (admin). Nada fica hardcoded — tudo vem do banco e pode ser alterado pela Camila.

---

## 8. Plano de construção (incremental — detalhado depois na fase de plano)
Ordem sugerida, cada etapa aprovada antes da seguinte:
1. **Fundação local:** projeto Next.js + Tailwind + design system (tokens da marca + Poppins + logo) — site público reconstruído com o visual aprovado, ainda sem backend.
2. **Rebrand completo do público** (Bloco A) + páginas novas estáticas (FAQ, landing E-books/Cursos).
3. **Backend base:** Supabase (schema + RLS) — **só após autorização** para tocar no Supabase.
4. **Auth + plataforma logada** (Pensamento diário, Comunidade, Cartografia: carta/sessões/materiais).
5. **Vendas + entitlements** (E-books, Cursos) e (conforme §7.1) pagamentos.
6. **Admin** para a Camila gerenciar tudo.
7. **Deploy** na Vercel — **só após autorização.**

---

## 9. Riscos / observações
- Sem o vetor original da logo, a extração do PDF pode exigir limpeza; buscar o .AI/.SVG do designer.
- Custo recorrente (Supabase, hospedagem de vídeo, e-mail) deve ser dimensionado — entra na conversa comercial já feita (R$700/mês previa isso).
- Conteúdo de saúde mental/autoconhecimento: cuidado com LGPD (dados pessoais) e com o tom; política de privacidade obrigatória.

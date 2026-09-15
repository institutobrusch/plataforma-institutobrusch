# Etapa 1 — Fundação + Site público (rebrand) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para implementar tarefa a tarefa. Steps usam checkbox (`- [ ]`).

**Goal:** Ter o site público do Instituto Brusch reconstruído em Next.js com a identidade visual nova da marca (marinho + dourado + Poppins + logo oficial), rodando localmente, sem backend.

**Architecture:** App Next.js (App Router, TypeScript) em `platform/`, estilizado com Tailwind + tokens da marca como CSS variables (claro/escuro). Conteúdo vem de um módulo de dados local tipado (`src/content/*`) — mesma forma que depois será trocada por Supabase, então as páginas já consomem via uma camada de acesso (`getEventos()`, etc.). Layout e seções são portados do protótipo aprovado `web/index.html`, traduzindo os tokens de cor verde→marinho.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Poppins (next/font), Vitest + Testing Library (testes de lógica/render), extração de logo do PDF da marca.

**Regra do projeto:** nada em GitHub/Supabase/Vercel sem autorização do Iago. Esta etapa é 100% local. Commits locais podem ser feitos (git local), mas **sem push**.

**Proporcionalidade (manual do Iago §1, §10):** TDD aplicado a lógica (camada de dados, filtro de eventos, tema). Seções apresentacionais são construídas portando o layout aprovado do protótipo; a verificação delas é visual/estrutural, não teste unitário de markup.

---

## Roadmap das etapas (cada uma terá seu próprio plano)
- **Etapa 1 (este plano):** fundação + site público com rebrand + páginas novas estáticas (FAQ, landings de E-books/Cursos, Sugestões público).
- **Etapa 2:** Supabase (schema + RLS) — *após autorização*.
- **Etapa 3:** Auth (e-mail/senha + Google) + convites; plataforma logada (Pensamento diário, Comunidade com moderação, Cartografia: carta/sessões/materiais).
- **Etapa 4:** Vendas + entitlements (E-books leitura, Cursos YouTube) + costura Asaas (sem ligar).
- **Etapa 5:** Admin/backoffice para a Camila.
- **Etapa 6:** Deploy Vercel + domínio + e-mail — *após autorização*.

---

## Estrutura de arquivos (Etapa 1)
```
platform/
  package.json, tsconfig.json, next.config.ts, tailwind.config.ts, postcss.config.mjs, vitest.config.ts
  public/brand/            # logo-navy.png, logo-gold.png, logo-mark.svg, favicon
  src/
    app/
      layout.tsx           # <html>, fontes, tema, Header, Footer
      globals.css          # tokens da marca (claro/escuro) + base
      page.tsx             # Início
      instituto/page.tsx
      camila/page.tsx
      eventos/page.tsx     # lista + filtro
      eventos/[slug]/page.tsx
      blog/page.tsx
      blog/[slug]/page.tsx
      depoimentos/page.tsx
      comunidade/page.tsx  # institucional (pública)
      cartografia/page.tsx # landing
      ebooks/page.tsx      # landing de venda
      cursos/page.tsx      # landing de venda
      faq/page.tsx
      contato/page.tsx     # inclui bloco "enviar sugestão" (público)
      not-found.tsx        # 404 personalizada
    components/
      Header.tsx, Footer.tsx, ThemeToggle.tsx, ThemeScript.tsx
      Button.tsx, Eyebrow.tsx, Section.tsx
      EventCard.tsx, PostCard.tsx, TestimonialCard.tsx, Pill.tsx
      EventosFilter.tsx
    content/
      types.ts             # tipos de domínio
      data.ts              # seed (portado do protótipo)
      index.ts             # getEventos(), getEvento(slug), getPosts()... (camada de acesso)
    lib/
      brand.ts             # constantes da marca (nomes, links)
  test/
      content.test.ts
      eventos-filter.test.ts
      event-card.test.tsx
```

---

## Task 0: Scaffold do projeto Next.js

**Files:**
- Create: `platform/` (via create-next-app)

- [ ] **Step 1: Criar o app**

Run (na raiz do repo):
```bash
npx create-next-app@latest platform --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack --use-npm
```
Expected: cria `platform/` com Next 15, Tailwind e TS. (Se perguntar algo interativo, aceitar defaults.)

- [ ] **Step 2: Instalar libs de teste**

Run:
```bash
cd platform && npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```
Expected: instala sem erros.

- [ ] **Step 3: Configurar Vitest** — criar `platform/vitest.config.ts`

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", globals: true, setupFiles: ["./test/setup.ts"] },
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});
```
Criar `platform/test/setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```
Adicionar em `platform/package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 4: Rodar o smoke test do build**

Run: `npm run build`
Expected: build OK (página inicial padrão do Next).

- [ ] **Step 5: Commit (local, sem push)**

```bash
git add platform && git commit -m "chore: scaffold Next.js app (platform) com Tailwind, TS e Vitest"
```

---

## Task 1: Tokens da marca (globals.css) + Tailwind + Poppins

**Files:**
- Modify: `platform/src/app/globals.css`
- Modify: `platform/tailwind.config.ts`
- Modify: `platform/src/app/layout.tsx` (fonte)

- [ ] **Step 1: Definir tokens** — substituir `platform/src/app/globals.css` por:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root{
  --bg:#FAF9F6; --surface:#FFFFFF; --surface-2:#F3F1EC; --line:#E4E1D9;
  --ink:#1B2230; --ink-2:#4C5360; --ink-3:#828A97;
  --navy:#2D3951; --navy-d:#1F2839; --navy-l:#5A6B85;
  --tan:#B0977F; --gold:#9C7E5E; --tan-bg:#EFEAE3;
  --radius:10px;
}
:root:not([data-theme="light"]){ }
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --bg:#181A1F; --surface:#20232A; --surface-2:#262A32; --line:#33363E;
    --ink:#EDEEF2; --ink-2:#B7BBC4; --ink-3:#868C97;
    --navy:#8FA0BE; --navy-d:#7C8DAC; --navy-l:#A9B6CC;
    --tan:#C6AD93; --gold:#C6A374; --tan-bg:#2A2E36;
  }
}
:root[data-theme="dark"]{
  --bg:#181A1F; --surface:#20232A; --surface-2:#262A32; --line:#33363E;
  --ink:#EDEEF2; --ink-2:#B7BBC4; --ink-3:#868C97;
  --navy:#8FA0BE; --navy-d:#7C8DAC; --navy-l:#A9B6CC;
  --tan:#C6AD93; --gold:#C6A374; --tan-bg:#2A2E36;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);
  font-family:var(--font-poppins),system-ui,-apple-system,sans-serif;
  -webkit-font-smoothing:antialiased;line-height:1.6}
h1,h2,h3,h4{line-height:1.14;letter-spacing:-.01em;text-wrap:balance;margin:0}
img{display:block;max-width:100%}
:focus-visible{outline:2.5px solid var(--tan);outline-offset:3px;border-radius:4px}
```

- [ ] **Step 2: Mapear tokens no Tailwind** — em `platform/tailwind.config.ts`, no `theme.extend.colors`:

```ts
colors: {
  bg: "var(--bg)", surface: "var(--surface)", "surface-2": "var(--surface-2)",
  line: "var(--line)", ink: "var(--ink)", "ink-2": "var(--ink-2)", "ink-3": "var(--ink-3)",
  navy: "var(--navy)", "navy-d": "var(--navy-d)", "navy-l": "var(--navy-l)",
  tan: "var(--tan)", gold: "var(--gold)", "tan-bg": "var(--tan-bg)",
},
```

- [ ] **Step 3: Carregar Poppins** — em `platform/src/app/layout.tsx`:

```tsx
import { Poppins } from "next/font/google";
const poppins = Poppins({ subsets:["latin"], weight:["400","500","600","700"], variable:"--font-poppins", display:"swap" });
// no <html className={poppins.variable}> ...
```

- [ ] **Step 4: Verificar build**

Run: `npm run build`
Expected: build OK, sem erro de CSS/tipos.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: design system da marca (tokens marinho/dourado, tema claro/escuro, Poppins)"
```

---

## Task 2: Extrair a logomarca do PDF para assets

**Files:**
- Create: `platform/public/brand/logo-navy.png`, `logo-gold.png`, `favicon.ico`

- [ ] **Step 1: Extrair PNGs de alta resolução da logo** (páginas 13 e 14 do manual)

Run (script Python no scratchpad; requer pymupdf já instalado):
```bash
python - <<'PY'
import pymupdf
src=r"C:\Users\PC\Desktop\Documentos Camila Brusch\Plataforma InstBrusch\01 Institucional\Identidade visual da marca.pdf"
out=r"C:\Users\PC\Desktop\Instituto Brusch\platform\public\brand"
import os; os.makedirs(out, exist_ok=True)
doc=pymupdf.open(src)
# pág 14 = logo marinho sobre branco (índice 13); pág 12 = logo dourado sobre marinho (índice 11)
for idx,name in [(13,"logo-navy"),(11,"logo-gold")]:
    doc[idx].get_pixmap(dpi=400).save(f"{out}/{name}-full.png")
print("ok")
PY
```
Expected: gera `logo-navy-full.png` e `logo-gold-full.png` em `platform/public/brand/`.

- [ ] **Step 2: Recortar a área da logo (remover margens/marca d'água J7)** com PIL

Run:
```bash
python - <<'PY'
from PIL import Image
import os
base=r"C:\Users\PC\Desktop\Instituto Brusch\platform\public\brand"
for name in ["logo-navy","logo-gold"]:
    im=Image.open(f"{base}/{name}-full.png").convert("RGBA")
    w,h=im.size
    # a logo ocupa a faixa central; recorte aproximado (ajustar se necessário)
    crop=im.crop((int(w*0.24), int(h*0.34), int(w*0.76), int(h*0.66)))
    crop.save(f"{base}/{name}.png")
    print(name, crop.size)
PY
```
Expected: gera `logo-navy.png` e `logo-gold.png` recortadas.

- [ ] **Step 3: Verificação humana (Iago/Claude)**: abrir as PNGs e conferir se a logo ficou limpa e sem a marca d'água "J7". Se o recorte cortou errado, ajustar os fatores do crop e repetir. (Ideal futuro: substituir pelo vetor .AI/.SVG do designer.)

- [ ] **Step 4: Favicon** — gerar a partir do monograma:
```bash
python - <<'PY'
from PIL import Image
base=r"C:\Users\PC\Desktop\Instituto Brusch\platform\public\brand"
im=Image.open(f"{base}/logo-navy.png").convert("RGBA")
# recorte do monograma B (canto esquerdo do lettering) — ajustar se necessário
w,h=im.size; mark=im.crop((0,0,int(h*1.0),h))
mark.thumbnail((64,64)); mark.save(f"{base}/favicon.png")
print("favicon ok")
PY
```
Copiar/definir como ícone do app depois em `app/icon.png` (Next detecta automaticamente).

- [ ] **Step 5: Commit**

```bash
git add platform/public/brand && git commit -m "chore: assets da logomarca extraidos do manual da marca"
```

---

## Task 3: Camada de conteúdo (tipos + seed + acesso) — COM TESTE

**Files:**
- Create: `platform/src/content/types.ts`, `data.ts`, `index.ts`
- Test: `platform/test/content.test.ts`

- [ ] **Step 1: Escrever o teste que falha** — `platform/test/content.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { getEventos, getEvento, getPosts, getDepoimentos } from "@/content";

describe("camada de conteúdo", () => {
  it("retorna eventos com campos essenciais", () => {
    const evs = getEventos();
    expect(evs.length).toBeGreaterThanOrEqual(6);
    for (const e of evs) {
      expect(e.slug).toBeTruthy();
      expect(["Presencial","Online"]).toContain(e.tipo);
      expect(typeof e.preco).toBe("number");
    }
  });
  it("busca evento por slug e retorna undefined p/ inexistente", () => {
    expect(getEvento("circulo-out")?.titulo).toContain("Círculo");
    expect(getEvento("nao-existe")).toBeUndefined();
  });
  it("tem posts e depoimentos do seed", () => {
    expect(getPosts().length).toBeGreaterThanOrEqual(3);
    expect(getDepoimentos().length).toBeGreaterThanOrEqual(6);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- content`
Expected: FAIL (módulo `@/content` não existe).

- [ ] **Step 3: Implementar tipos** — `platform/src/content/types.ts`

```ts
export type EventoTipo = "Presencial" | "Online";
export interface Evento { slug:string; titulo:string; tipo:EventoTipo; data:string; local:string; preco:number; vagas:string; descricao:string; posterUrl?:string; }
export interface Post { slug:string; titulo:string; autor:string; cargo:string; data:string; resumo:string; corpo:string[]; imagemUrl?:string; }
export interface Depoimento { nome:string; contexto:string; texto:string; iniciais:string; }
export interface Grupo { titulo:string; descricao:string; }
export interface FaqItem { pergunta:string; resposta:string; }
```

- [ ] **Step 4: Implementar seed** — `platform/src/content/data.ts`

Portar os dados do protótipo `web/index.html` (arrays EVENTOS, POSTS, DEPOS, GROUPS, FAQ) para constantes tipadas. Conteúdo de referência (fiel ao protótipo):
- 6 eventos: `circulo-out` (O Círculo · Turma de Outubro, Presencial, 18 out 2026 19h, Sede do Instituto — Palmas/TO, 180, "6 vagas"), `vivencia-sistemica` (Vivência: Minha história familiar, Presencial, 25 out 2026 9h, Espaço Semente — Palmas/TO, 240, "12 vagas"), `live-ansiedade` (Online: Ansiedade e presença, Online, 30 out 2026 20h, Ao vivo pela plataforma, 0, "Aberto"), `circulo-online` (O Círculo Online · Novembro, Online, 8 nov 2026 19h, Ao vivo pela plataforma, 150, "10 vagas"), `retiro` (Retiro de Autoconhecimento, Presencial, 6 dez 2026 dia inteiro, Serra do Lajeado — TO, 520, "20 vagas"), `workshop-cartas` (Online: Introdução à Cartografia, Online, 12 dez 2026 20h, Ao vivo pela plataforma, 90, "Aberto"). Descrições conforme protótipo.
- 3 posts: `o-circulo` (Instituto Brusch/Equipe/21 ago 2026), `cartografia-mapa` (Camila Brusch/Psicóloga · fundadora/5 ago 2026), `coluna-corpo` (Dra. Helena Prado/Colunista convidada/18 jul 2026) — resumo e corpo conforme protótipo.
- 7 depoimentos (Marina L., Rafael S., Juliana P., André M., Camila R., Bruno T., Letícia F.) com contexto e texto conforme protótipo.
- FAQ: criar 5 itens plausíveis (o protótipo não tinha FAQ) — ex.: "Como funciona O Círculo?", "A Cartografia é uma leitura de futuro?", "Os encontros online são ao vivo?", "Como faço para me inscrever?", "Os áudios ficam disponíveis por quanto tempo?".

> Nota: este seed será migrado para o Supabase na Etapa 2 e editável no admin (Etapa 5). Manter os textos aqui idênticos ao protótipo aprovado.

- [ ] **Step 5: Implementar acesso** — `platform/src/content/index.ts`

```ts
import { EVENTOS, POSTS, DEPOIMENTOS, GRUPOS, FAQ } from "./data";
export const getEventos = () => EVENTOS;
export const getEvento = (slug:string) => EVENTOS.find(e => e.slug === slug);
export const getPosts = () => POSTS;
export const getPost = (slug:string) => POSTS.find(p => p.slug === slug);
export const getDepoimentos = () => DEPOIMENTOS;
export const getGrupos = () => GRUPOS;
export const getFaq = () => FAQ;
export * from "./types";
```

- [ ] **Step 6: Rodar teste até passar**

Run: `npm test -- content`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: camada de conteudo tipada com seed do prototipo (+testes)"
```

---

## Task 4: Componentes base + Layout (Header/Footer/Tema)

**Files:**
- Create: `platform/src/components/{Header,Footer,ThemeToggle,ThemeScript,Button,Eyebrow,Section,Pill}.tsx`
- Modify: `platform/src/app/layout.tsx`

- [ ] **Step 1: ThemeScript (sem flash)** — `ThemeScript.tsx` injeta script inline que lê `localStorage.theme` e seta `data-theme` no `<html>` antes da pintura. ThemeToggle alterna entre light/dark/system e persiste em `localStorage` (try/catch).

- [ ] **Step 2: Componentes de UI** — `Button` (variantes primária/ghost, cor navy), `Eyebrow` (rótulo tan, uppercase, tracking), `Section` (wrapper max-w 1160px, padding vertical), `Pill` (pres=tan-bg/navy, online=gold). Portar estilos do protótipo, trocando verde→navy e sage→tan.

- [ ] **Step 3: Header** — logo (`/brand/logo-navy.png`, versão clara no tema escuro via CSS), nav: Início, O Instituto, Camila Brusch, Eventos, Blog, Depoimentos, Comunidade, e um botão destacado **"Acessar a plataforma"** (por ora aponta para `/contato` ou `#`, pois a plataforma logada é a Etapa 3). Menu hambúrguer no mobile. Marcar link ativo via `usePathname()`.

- [ ] **Step 4: Footer** — fundo navy-d, 3 colunas (marca+descrição, navegação, contato: Instagram @institutobrusch, Palmas/TO). Portar do protótipo.

- [ ] **Step 5: layout.tsx** — montar `<html>` com fonte + ThemeScript no `<head>`, `<body>` com Header + `{children}` + Footer. Metadata base (title template "Instituto Brusch", description).

- [ ] **Step 6: Verificar**

Run: `npm run dev` e abrir `http://localhost:3000` — Header/Footer aparecem com a marca; toggle de tema funciona sem flash. Depois `npm run build`.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: layout base (header com marca, footer, tema claro/escuro) e componentes de UI"
```

---

## Task 5: Página Início

**Files:** Create `platform/src/app/page.tsx` (+ usa componentes da Task 4/6)

- [ ] **Step 1:** Construir as seções do protótipo, traduzindo cores: (1) hero full-bleed com foto (usar por ora imagem placeholder em `public/`, marcada como ilustrativa) + texto sobreposto ("Cuidar de vínculos é *transformar* histórias." — "transformar" em itálico/tan) + CTAs; (2) faixa de 4 pilares (fundo navy) — Segurança e Confiança, Profissionais Qualificados, Grupos para Diferentes Necessidades, Transformação que Gera Impacto; (3) Próximos encontros (3 primeiros de `getEventos()` via `EventCard`); (4) Sobre (split com foto + texto); (5) Depoimentos em destaque; (6) CTA-strip; conforme protótipo.
- [ ] **Step 2:** Verificar em `npm run dev` (desktop + largura ~400px). Build.
- [ ] **Step 3:** Commit `feat: pagina Inicio com rebrand`.

---

## Task 6: EventCard/PostCard/TestimonialCard + páginas O Instituto e Camila

**Files:** Create `components/{EventCard,PostCard,TestimonialCard}.tsx`, `app/instituto/page.tsx`, `app/camila/page.tsx`
- Test: `platform/test/event-card.test.tsx`

- [ ] **Step 1: Teste do EventCard (render por dados)** — `event-card.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import EventCard from "@/components/EventCard";

it("renderiza titulo, tipo e valor do evento", () => {
  render(<EventCard evento={{ slug:"x", titulo:"Evento Teste", tipo:"Online", data:"1 jan", local:"Online", preco:0, vagas:"Aberto", descricao:"d" }} />);
  expect(screen.getByText("Evento Teste")).toBeInTheDocument();
  expect(screen.getByText("Online")).toBeInTheDocument();
  expect(screen.getByText(/Gratuito/i)).toBeInTheDocument();
});
```

- [ ] **Step 2:** Rodar: `npm test -- event-card` → FAIL.
- [ ] **Step 3:** Implementar `EventCard` (poster/aspect, Pill do tipo, título, meta data, preço "R$ X"/"Gratuito", link para `/eventos/[slug]`). Implementar `PostCard` e `TestimonialCard` (apresentacionais).
- [ ] **Step 4:** Rodar: `npm test -- event-card` → PASS.
- [ ] **Step 5:** Construir `instituto/page.tsx` e `camila/page.tsx` (split factbox + foto + prose), portando textos do protótipo. Fotos: usar as reais da pasta `07 Imagens e Assets Visuais` (Camila) quando aplicável — copiar para `public/` na Etapa de conteúdo; por ora placeholder marcado.
- [ ] **Step 6:** Build + verificação visual. Commit `feat: cards + paginas O Instituto e Camila`.

---

## Task 7: Eventos (lista + filtro + detalhe) — filtro COM TESTE

**Files:** Create `app/eventos/page.tsx`, `app/eventos/[slug]/page.tsx`, `components/EventosFilter.tsx`, `src/lib/filterEventos.ts`
- Test: `platform/test/eventos-filter.test.ts`

- [ ] **Step 1: Teste do filtro** — `eventos-filter.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { filterEventos } from "@/lib/filterEventos";
import { getEventos } from "@/content";

const evs = getEventos();
describe("filterEventos", () => {
  it("'Todos' retorna tudo", () => expect(filterEventos(evs,"Todos").length).toBe(evs.length));
  it("'Presencial' só presenciais", () => expect(filterEventos(evs,"Presencial").every(e=>e.tipo==="Presencial")).toBe(true));
  it("'Online' só online", () => expect(filterEventos(evs,"Online").every(e=>e.tipo==="Online")).toBe(true));
});
```

- [ ] **Step 2:** Rodar: `npm test -- eventos-filter` → FAIL.
- [ ] **Step 3:** Implementar `src/lib/filterEventos.ts`:

```ts
import type { Evento } from "@/content";
export type Filtro = "Todos" | "Presencial" | "Online";
export const filterEventos = (evs:Evento[], f:Filtro) => f==="Todos" ? evs : evs.filter(e=>e.tipo===f);
```

- [ ] **Step 4:** Rodar: `npm test -- eventos-filter` → PASS.
- [ ] **Step 5:** `EventosFilter.tsx` (client component com chips Todos/Presencial/Online usando o helper) + `eventos/page.tsx` (grid). `eventos/[slug]/page.tsx`: detalhe com `getEvento(slug)` → `notFound()` se ausente; botão "Inscrever-se" abre modal simulado (placeholder até Etapa 4). `generateStaticParams` a partir dos slugs.
- [ ] **Step 6:** Build + verificação. Commit `feat: eventos (lista, filtro testado, detalhe)`.

---

## Task 8: Blog (lista + detalhe)

**Files:** Create `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`
- [ ] **Step 1:** Lista com `getPosts()` (PostCard: data · autor, título, resumo). Detalhe com `getPost(slug)` → `notFound()`; render do `corpo` (parágrafos), assinatura autor/cargo. `generateStaticParams`.
- [ ] **Step 2:** Build + verificação. Commit `feat: blog (lista e post)`.

---

## Task 9: Depoimentos + Comunidade (institucional pública)

**Files:** Create `app/depoimentos/page.tsx`, `app/comunidade/page.tsx`
- [ ] **Step 1:** Depoimentos: masonry de `TestimonialCard` com `getDepoimentos()`. Comunidade (pública/institucional): apresentação dos grupos (`getGrupos()`) + chamada para entrar na plataforma. (A comunidade real logada é Etapa 3.)
- [ ] **Step 2:** Build + verificação. Commit `feat: depoimentos e comunidade institucional`.

---

## Task 10: Cartografia (landing pública)

**Files:** Create `app/cartografia/page.tsx`
- [ ] **Step 1:** Portar landing do protótipo (split + 3 features: A carta / Áudios & resumos / *(sem "Recomendação mensal")* — trocar a 3ª feature por "Materiais das sessões" para refletir a mudança de escopo) + CTA "Contratar" (fluxo simulado, placeholder até Etapa 4) e "Acessar a plataforma".
- [ ] **Step 2:** Build + verificação. Commit `feat: landing da Cartografia`.

---

## Task 11: Páginas novas — E-books, Cursos (landings), FAQ, Contato/Sugestões

**Files:** Create `app/ebooks/page.tsx`, `app/cursos/page.tsx`, `app/faq/page.tsx`, `app/contato/page.tsx`, `app/not-found.tsx`
- [ ] **Step 1: E-books (landing de venda):** grid de e-books (placeholder de catálogo — 3 itens de exemplo no seed, marcados como exemplo) com capa, título, preço, botão "Comprar" (simulado; leitura real na plataforma vem na Etapa 4). Texto explicando que a leitura é dentro da plataforma.
- [ ] **Step 2: Cursos (landing de venda):** grid de cursos (3 exemplos no seed) com capa, título, preço, botão "Comprar" (simulado). Nota: aulas via YouTube dentro da plataforma (Etapa 4).
- [ ] **Step 3: FAQ:** acordeão acessível (`<details>`/`<summary>` ou client component) com `getFaq()`.
- [ ] **Step 4: Contato + Sugestões:** dados de contato (Instagram, Palmas/TO) + formulário "Enviar sugestão" (público). Nesta etapa o submit apenas valida e mostra estado de sucesso (sem backend); na Etapa 3/5 grava em `suggestions`. Formulário com estado de erro visível.
- [ ] **Step 5: 404:** `not-found.tsx` personalizada com a marca.
- [ ] **Step 6:** Adicionar E-books e Cursos ao Header/Footer nav. Build + verificação. Commit `feat: paginas E-books, Cursos, FAQ, Contato/Sugestoes e 404`.

---

## Task 12: Passe final — responsividade, acessibilidade, SEO básico, metadata

**Files:** vários (ajustes)
- [ ] **Step 1:** Conferir em ~400px todas as páginas (sem scroll horizontal; menus/gride empilham). Ajustar.
- [ ] **Step 2:** `alt` em todas as imagens; foco visível; contraste dos tokens em ambos os temas.
- [ ] **Step 3:** `metadata` por página (title/description únicos) + Open Graph básico + favicon/app icon. `robots`/`sitemap` podem ficar para o deploy.
- [ ] **Step 4:** `npm run build` limpo; `npm test` verde.
- [ ] **Step 5:** Commit `chore: passe de responsividade, a11y e metadata (Etapa 1 concluida)`.

---

## Self-review (cobertura x spec)
- Rebrand (§3.1): Tasks 1, 2, 4 ✔ (tokens, Poppins, logo).
- Site público com layout aprovado (§3): Tasks 5–10 ✔.
- Páginas novas E-books/Cursos/FAQ/Sugestões (§3.3): Task 11 ✔ (landings/estáticas; venda real e leitura na Etapa 4).
- Conteúdo do protótipo como seed editável (§7.8): Task 3 ✔ (seed isolado, migrável).
- Área logada, auth, entitlements, admin, Supabase, Asaas: **fora da Etapa 1** — Etapas 2–6 (roadmap).
- Segurança de backend/RLS/pagamentos (§4–§5): não se aplica à Etapa 1 (sem backend); formulários já com validação/estado de erro.

**Observação de proporcionalidade:** testes unitários concentrados em lógica (conteúdo, filtro, render de card por dados). Seções apresentacionais verificadas por build + inspeção visual, conforme manual §10.
```

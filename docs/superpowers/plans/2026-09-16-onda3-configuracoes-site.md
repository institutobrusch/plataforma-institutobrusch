# Configurações do site (editor de conteúdo institucional) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar ao admin uma área "Site" para editar textos, imagens e SEO das páginas institucionais (home, instituto, camila, faq, contato) e da marca/contatos globais, com publish imediato.

**Architecture:** Tabela `site_content` (1 linha JSON por seção) + `faq_items` (lista). As páginas leem via helper que faz merge do JSON do banco sobre defaults tipados no código (nunca renderiza vazio). Admin em `/admin/site` com um formulário por seção, componentes de campo reutilizáveis, e um core de save compartilhado (`upsert` + auditoria + `revalidatePath`). Imagens no bucket `capas/site/`.

**Tech Stack:** Next.js 16 (App Router, Server Actions, `useActionState`), React 19, TypeScript, Tailwind v4, Supabase (`@supabase/ssr`), Vitest.

**Diretório de trabalho:** `platform/`. Pastas com parênteses `(site)`/`(admin)` devem ser citadas entre aspas em comandos git.

---

## Task 1: Migração do banco + seed + tipos

**Files:**
- Migração aplicada ao Supabase `jnwjrjzinqqcxlvleznq` (via MCP `apply_migration`, nome `12_site_content`)
- Regerar: `platform/src/lib/database.types.ts`

- [ ] **Step 1: Aplicar a migração** (MCP Supabase `apply_migration`, project `jnwjrjzinqqcxlvleznq`, name `12_site_content`):

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

create policy "site_content pub" on public.site_content for select using (true);
create policy "site_content adm" on public.site_content for all
  using (public.is_admin()) with check (public.is_admin());

create policy "faq pub" on public.faq_items for select using (ativo or public.is_admin());
create policy "faq adm" on public.faq_items for all
  using (public.is_admin()) with check (public.is_admin());
```

- [ ] **Step 2: Seed do FAQ a partir do seed atual** (MCP `execute_sql`) — inserir os 5 itens de `src/content/data.ts` (aspas simples escapadas como `''`):

```sql
insert into public.faq_items (pergunta, resposta, ordem, ativo) values
  ('Como funciona O Círculo?', 'É uma terapia em grupo reduzido, conduzida pela Camila, em ciclos de quatro encontros. Não há palestra — o foco é a escuta e a troca entre os participantes.', 0, true),
  ('A Cartografia é uma leitura de futuro?', 'Não. A carta não prevê o futuro; ela ilumina o seu momento presente. É uma ferramenta de autoconhecimento com acompanhamento mensal (leituras, áudios e resumos).', 1, true),
  ('Os encontros online são ao vivo?', 'Sim, os encontros online acontecem ao vivo pela plataforma, com grupo reduzido para preservar a intimidade da experiência.', 2, true),
  ('Como faço para me inscrever em um evento?', 'Na página do evento, clique em "Inscrever-se" e siga o passo a passo. Você recebe a confirmação e as instruções de acesso pela plataforma.', 3, true),
  ('Por quanto tempo os áudios das sessões ficam disponíveis?', 'Os áudios e resumos das suas sessões ficam disponíveis na sua área da plataforma para revisitar quando quiser, enquanto seu acesso estiver ativo.', 4, true);
```

> As linhas de `site_content` NÃO são semeadas por SQL: os defaults do código (Task 2) cobrem tudo até o admin salvar. Isso mantém o site idêntico sem duplicar conteúdo.

- [ ] **Step 3: Regerar os tipos** (MCP `generate_typescript_types`) e sobrescrever `platform/src/lib/database.types.ts` com o resultado.

- [ ] **Step 4: Verificar tabelas** (MCP `list_tables`): confirmar `site_content` e `faq_items` com as policies.

- [ ] **Step 5: Commit**

```bash
git add platform/src/lib/database.types.ts
git commit -m "feat(site): migracao site_content + faq_items (RLS) e tipos"
```

---

## Task 2: Defaults tipados + merge (TDD)

**Files:**
- Create: `platform/src/lib/site/types.ts`
- Create: `platform/src/lib/site/defaults.ts`
- Create: `platform/src/lib/site/merge.ts`
- Test: `platform/src/lib/site/merge.test.ts`

- [ ] **Step 1: Tipos das seções** — criar `types.ts` com interfaces para cada chave. Exato conjunto de campos (da spec):

```ts
export type CTA = { label: string; href: string; variant?: "solid" | "ghost" };
export type Bloco = { titulo: string; texto: string };
export type SecaoTexto = { titulo: string; paragrafos: string[] };
export type Frente = { destaque: string; texto: string };
export type Canal = { label: string; valor: string; href?: string };

export interface MarcaContent {
  logoGoldPath: string; logoNavyPath: string; faviconPath: string;
  rodapeTagline: string; instagramUrl: string; instagramHandle: string; cidadeUf: string;
}
export interface HomeContent {
  eyebrow: string; heroTitulo: string; heroTituloEnfase: string; heroTituloFim: string;
  heroSubtitulo: string; ctaPrimarioLabel: string; ctaPrimarioHref: string;
  ctaSecundarioLabel: string; ctaSecundarioHref: string; blocos: Bloco[];
  seoTitle: string; seoDescription: string;
}
export interface InstitutoContent {
  fotoPath: string; eyebrow: string; titulo: string; subtitulo: string;
  frentesTitulo: string; frentes: Frente[]; secoes: SecaoTexto[]; cta: CTA;
  seoTitle: string; seoDescription: string;
}
export interface CamilaContent {
  fotoPath: string; eyebrow: string; nome: string; resumo: string;
  formacao: string[]; secoes: SecaoTexto[]; ctas: CTA[];
  seoTitle: string; seoDescription: string;
}
export interface ContatoContent {
  eyebrow: string; titulo: string; canais: Canal[]; textoAcesso: string;
  seoTitle: string; seoDescription: string;
}
export interface FaqContent { seoTitle: string; seoDescription: string; }

export type ChaveSecao = "marca" | "home" | "instituto" | "camila" | "contato" | "faq";
export interface SecaoMap {
  marca: MarcaContent; home: HomeContent; instituto: InstitutoContent;
  camila: CamilaContent; contato: ContatoContent; faq: FaqContent;
}
```

- [ ] **Step 2: Defaults** — criar `defaults.ts` exportando `const DEFAULTS: SecaoMap` com os **valores atuais** copiados de `(site)/page.tsx`, `instituto/page.tsx`, `camila/page.tsx`, `contato/page.tsx`, `Header.tsx`, `Footer.tsx`. Ex. (home, resumido — copiar textos reais das páginas):

```ts
import type { SecaoMap } from "./types";
export const DEFAULTS: SecaoMap = {
  marca: {
    logoGoldPath: "", logoNavyPath: "", faviconPath: "",
    rodapeTagline: "Psicologia, terapia sistêmica e autoconhecimento em Palmas (TO). Psicoterapia, O Círculo e Cartografia.",
    instagramUrl: "https://instagram.com/institutobrusch",
    instagramHandle: "@institutobrusch", cidadeUf: "Palmas · Tocantins",
  },
  home: {
    eyebrow: "Palmas · Tocantins",
    heroTitulo: "Cuidar de vínculos é", heroTituloEnfase: "transformar", heroTituloFim: "histórias.",
    heroSubtitulo: "A terapia em grupo é um espaço de escuta, aprendizado e apoio para viver com mais leveza e propósito.",
    ctaPrimarioLabel: "Ver encontros", ctaPrimarioHref: "/eventos",
    ctaSecundarioLabel: "Conhecer a Cartografia", ctaSecundarioHref: "/cartografia",
    blocos: [
      { titulo: "Segurança e Confiança", texto: "Ambiente estruturado, ético e confidencial." },
      { titulo: "Profissionais Qualificados", texto: "Equipe interdisciplinar com ampla experiência." },
      { titulo: "Grupos para Diferentes Necessidades", texto: "Temas e formatos que atendem diversos objetivos." },
      { titulo: "Transformação que Gera Impacto", texto: "Mais consciência, escolhas saudáveis e relações melhores." },
    ],
    seoTitle: "Instituto Brusch", seoDescription: "Psicologia, terapia sistêmica e autoconhecimento em Palmas (TO).",
  },
  instituto: {
    fotoPath: "", eyebrow: "Sobre", titulo: "O Instituto Brusch",
    subtitulo: "Um centro integrado de saúde mental e autoconhecimento em Palmas (TO), onde a psicoterapia encontra a expansão de consciência.",
    frentesTitulo: "Nossas frentes",
    frentes: [
      { destaque: "O Círculo", texto: "terapia em grupo aberta, em ciclos." },
      { destaque: "Clínico & sistêmico", texto: "psicoterapia individual e familiar." },
      { destaque: "Cartografia", texto: "autoconhecimento com acompanhamento mensal." },
    ],
    secoes: [
      { titulo: "Pensamento sistêmico", paragrafos: ["Olhamos para a pessoa dentro das suas relações — família, história e contexto. Muitos padrões que repetimos não nasceram em nós; reconhecê-los é o primeiro passo para reorganizá-los."] },
      { titulo: "Expansão de consciência", paragrafos: ["Autoconhecimento não é um destino, é um caminho. Unimos escuta clínica a práticas de presença para ampliar a forma como cada pessoa se percebe e se relaciona com a própria história."] },
    ],
    cta: { label: "Ver encontros", href: "/eventos", variant: "solid" },
    seoTitle: "O Instituto",
    seoDescription: "O Instituto Brusch — centro integrado de saúde mental e autoconhecimento em Palmas (TO), onde a psicoterapia encontra a expansão de consciência.",
  },
  camila: {
    fotoPath: "", eyebrow: "A idealizadora", nome: "Camila Brusch",
    resumo: "Psicóloga clínica, terapeuta sistêmica e idealizadora do Instituto Brusch.",
    formacao: ["Psicóloga clínica (CRP)", "Terapeuta sistêmica", "Idealizadora de O Círculo e da Cartografia", "Atuação clínica e trabalhos em grupo"],
    secoes: [
      { titulo: "Uma escuta que acolhe", paragrafos: ["O trabalho da Camila nasce da convicção de que o encontro cura. Na clínica e nos grupos, ela cria espaços seguros para que cada pessoa possa olhar para a própria história com honestidade e cuidado.", "Da psicoterapia individual ao Círculo e à Cartografia, sua atuação une método clínico e um convite constante à presença e ao autoconhecimento."] },
    ],
    ctas: [ { label: "Conhecer a Cartografia", href: "/cartografia", variant: "solid" }, { label: "Agendar uma conversa", href: "/contato", variant: "ghost" } ],
    seoTitle: "Camila Brusch", seoDescription: "Camila Brusch — psicóloga clínica, terapeuta sistêmica e idealizadora do Instituto Brusch, em Palmas (TO).",
  },
  contato: {
    eyebrow: "Contato", titulo: "Fale com o Instituto",
    canais: [ { label: "Instagram", valor: "@institutobrusch", href: "https://instagram.com/institutobrusch" }, { label: "", valor: "Palmas · Tocantins" } ],
    textoAcesso: "O acesso à plataforma (Cartografia, cursos e e-books) acontece após a compra ou convite. Em breve o login estará disponível aqui.",
    seoTitle: "Contato & Sugestões", seoDescription: "Fale com o Instituto Brusch e envie suas sugestões. Palmas, Tocantins.",
  },
  faq: { seoTitle: "Perguntas frequentes", seoDescription: "Perguntas frequentes sobre o Instituto Brusch." },
};
```

> O implementador DEVE abrir `instituto/page.tsx` e preencher o default `instituto` com o conteúdo real (eyebrow/título/subtítulo/seções).

- [ ] **Step 3: Escrever o teste do merge** (falha primeiro):

```ts
import { describe, it, expect } from "vitest";
import { mergeConteudo } from "./merge";

const def = { a: "x", b: "y", lista: [{ t: "1" }], n: 3 };
describe("mergeConteudo", () => {
  it("retorna o default quando valor é vazio/nulo", () => {
    expect(mergeConteudo(def, null)).toEqual(def);
    expect(mergeConteudo(def, {})).toEqual(def);
  });
  it("sobrescreve apenas campos presentes", () => {
    expect(mergeConteudo(def, { a: "z" })).toEqual({ ...def, a: "z" });
  });
  it("substitui arrays inteiros (não faz merge item a item)", () => {
    expect(mergeConteudo(def, { lista: [{ t: "9" }, { t: "8" }] }).lista).toEqual([{ t: "9" }, { t: "8" }]);
  });
  it("ignora chaves ausentes no valor e mantém o default", () => {
    expect(mergeConteudo(def, { n: 5 })).toEqual({ ...def, n: 5 });
  });
});
```

- [ ] **Step 4: Rodar o teste (deve falhar)** — `npx vitest run src/lib/site/merge.test.ts` → FAIL (mergeConteudo não definido).

- [ ] **Step 5: Implementar `merge.ts`** (deep-merge simples; arrays e primitivos substituem, objetos planos mesclam):

```ts
type Obj = Record<string, unknown>;
export function mergeConteudo<T>(def: T, valor: unknown): T {
  if (valor == null || typeof valor !== "object" || Array.isArray(valor)) return def;
  const out: Obj = { ...(def as unknown as Obj) };
  for (const [k, v] of Object.entries(valor as Obj)) {
    if (v === undefined) continue;
    const d = (def as unknown as Obj)[k];
    if (v && typeof v === "object" && !Array.isArray(v) && d && typeof d === "object" && !Array.isArray(d)) {
      out[k] = mergeConteudo(d, v);
    } else {
      out[k] = v;
    }
  }
  return out as unknown as T;
}
```

- [ ] **Step 6: Rodar o teste (deve passar)** — `npx vitest run src/lib/site/merge.test.ts` → PASS.

- [ ] **Step 7: Commit**

```bash
git add platform/src/lib/site
git commit -m "feat(site): defaults tipados por secao + merge com fallback (TDD)"
```

---

## Task 3: Helpers de leitura do conteúdo

**Files:**
- Create: `platform/src/lib/site/content.ts`

- [ ] **Step 1: Implementar leitura** — `content.ts`:

```ts
import "server-only";
import { createClient } from "@/lib/supabase/server";
import { DEFAULTS } from "./defaults";
import { mergeConteudo } from "./merge";
import type { ChaveSecao, SecaoMap } from "./types";

export async function getConteudo<K extends ChaveSecao>(chave: K): Promise<SecaoMap[K]> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("valor").eq("chave", chave).maybeSingle();
  return mergeConteudo(DEFAULTS[chave], data?.valor ?? null);
}

export type FaqItem = { id: string; pergunta: string; resposta: string };
export async function getFaq(): Promise<FaqItem[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("faq_items").select("id,pergunta,resposta").eq("ativo", true).order("ordem", { ascending: true });
  return data ?? [];
}

export function imagemUrl(path: string, fallback: string): string {
  if (!path) return fallback;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/capas/${path}`;
}
```

- [ ] **Step 2: Type-check** — `npx tsc --noEmit` → sem erros.

- [ ] **Step 3: Commit**

```bash
git add platform/src/lib/site/content.ts
git commit -m "feat(site): helpers getConteudo/getFaq/imagemUrl"
```

---

## Task 4: Site público lendo do banco (marca, home, instituto, camila, contato, faq, SEO, favicon)

**Files:**
- Modify: `platform/src/components/Header.tsx`, `platform/src/components/Footer.tsx`
- Modify: `platform/src/app/(site)/page.tsx`, `instituto/page.tsx`, `camila/page.tsx`, `contato/page.tsx`, `faq/page.tsx`
- Create: `platform/src/app/icon.tsx` (favicon dinâmico), remover uso estático se necessário

- [ ] **Step 1: Marca no Header/Footer** — tornar os componentes `async` (ou receber props de um wrapper server). Ler `const marca = await getConteudo("marca")`. Trocar textos fixos (`rodapeTagline`, `instagramHandle`, `instagramUrl`, `cidadeUf`) pelos campos. Logos: `imagemUrl(marca.logoGoldPath, "/brand/logo-gold.png")` e navy análogo. Se o componente não puder ser async no contexto atual, criar um server component wrapper que busca e passa por props. Manter classes/markup atuais.

- [ ] **Step 2: Home** — `(site)/page.tsx` já é `async`. Adicionar `const home = await getConteudo("home")` e substituir eyebrow, `heroTitulo`/`heroTituloEnfase`/`heroTituloFim`, `heroSubtitulo`, os 2 CTAs e o `.map` dos 4 blocos por `home.blocos`. Adicionar `export async function generateMetadata()` usando `home.seoTitle`/`seoDescription`.

- [ ] **Step 3: Instituto/Camila/Contato** — tornar cada `page.tsx` `async`, ler a seção correspondente, substituir textos/imagem (Camila: `imagemUrl(camila.fotoPath, "/fotos/camila-1.jpg")`), listas (`formacao`, `secoes`, `canais`, `ctas`) por `.map`, e `generateMetadata` a partir dos campos SEO.

- [ ] **Step 4: FAQ** — `faq/page.tsx` `async`: `const [faq, meta] = [await getFaq(), await getConteudo("faq")]`; renderizar a lista de `faq_items` (fallback: se vazio, usar seed atual) e `generateMetadata` de `meta`.

- [ ] **Step 5: Favicon dinâmico** — criar `app/icon.tsx`:

```tsx
import { getConteudo } from "@/lib/site/content";
import { imagemUrl } from "@/lib/site/content";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function Icon() {
  const marca = await getConteudo("marca");
  redirect(imagemUrl(marca.faviconPath, "/icon.png"));
}
```

> Se o padrão de `redirect` em `icon` não funcionar no runtime, o implementador deve, em alternativa, servir via `<link rel="icon">` no `layout.tsx` a partir de `imagemUrl(marca.faviconPath, "/icon.png")`. Escolher a alternativa que builda e funciona; documentar no relatório.

- [ ] **Step 6: Verificar** — `npm run build`; conferir que `/`, `/instituto`, `/camila`, `/faq`, `/contato` continuam renderizando o mesmo conteúdo (defaults) sem erro, e que o header/footer aparecem normais.

- [ ] **Step 7: Commit**

```bash
git add platform/src/app platform/src/components
git commit -m "feat(site): paginas institucionais e marca leem de site_content (com fallback)"
```

---

## Task 5: Componentes de campo + core de save + menu "Site"

**Files:**
- Modify: `platform/src/components/admin/AdminShell.tsx` (menu)
- Create: `platform/src/lib/site/save.ts` (core server)
- Create: `platform/src/components/admin/site/Fields.tsx` (campos reutilizáveis)
- Create: `platform/src/app/(admin)/admin/site/page.tsx` (índice das seções)

- [ ] **Step 1: Item de menu** — em `AdminShell.tsx`, adicionar ao `MENU` (após "Painel"): `{ href: "/admin/site", label: "Site" }`.

- [ ] **Step 2: Core de save** — `save.ts`:

```ts
import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { registrarAcao } from "@/lib/admin/audit";
import { montarNomeArquivo } from "@/lib/admin/carto";
import type { Json } from "@/lib/database.types";
import type { ChaveSecao } from "./types";

const ROTAS: Record<ChaveSecao, string[]> = {
  marca: ["/", "/instituto", "/camila", "/faq", "/contato"],
  home: ["/"], instituto: ["/instituto"], camila: ["/camila"],
  contato: ["/contato"], faq: ["/faq"],
};

export async function salvarConteudo(chave: ChaveSecao, valor: Record<string, unknown>) {
  const supabase = await createClient();
  const { error } = await supabase.from("site_content")
    .upsert({ chave, valor: valor as Json, updated_at: new Date().toISOString() });
  if (error) return { erro: "Não foi possível salvar." };
  await registrarAcao("update_site_content", { entidade: "site_content", entidadeId: chave });
  for (const r of ROTAS[chave]) revalidatePath(r);
  revalidatePath("/admin/site");
  return { ok: true as const };
}

export async function uploadSiteImagem(file: File): Promise<string | { erro: string }> {
  const supabase = await createClient();
  const nome = montarNomeArquivo(file.name, "site");
  const { error } = await supabase.storage.from("capas").upload(nome, file, {
    contentType: file.type || "application/octet-stream", upsert: false,
  });
  if (error) return { erro: "Falha ao enviar a imagem." };
  return nome;
}
```

- [ ] **Step 3: Campos reutilizáveis** — `Fields.tsx` (client components ou server-friendly inputs). Exportar:
  - `TextField({ name, label, defaultValue })` — `<input>`
  - `TextareaField({ name, label, defaultValue })` — `<textarea>`
  - `ImageField({ name, label, currentUrl })` — `<input type="file">` + preview da imagem atual
  - `ListField` — client component que edita um array serializado num `<input type="hidden" name>` como JSON (linhas add/remover). Para arrays de strings (`formacao`) e de objetos (`blocos`, `secoes`, `canais`, `ctas`). Deve permitir add/remover/reordenar (setas cima/baixo) e escrever `JSON.stringify` no hidden ao mudar.
  Todos com estilo consistente com os forms existentes do admin (classes das telas atuais).

- [ ] **Step 4: Índice `/admin/site`** — `page.tsx` (server, dentro do layout admin que já aplica `requireAdmin`): lista de cards/links para as seções: Marca & Contatos, Home, Instituto, Camila, Contato, FAQ. Pode ser navegação por sub-rotas (`/admin/site/marca`, etc.) OU âncoras numa página única. Escolher sub-rotas (uma página por seção) para forms menores.

- [ ] **Step 5: Verificar** — `npm run build`; menu "Site" aparece; `/admin/site` abre para admin.

- [ ] **Step 6: Commit**

```bash
git add platform/src/app/"(admin)"/admin/site platform/src/lib/site/save.ts platform/src/components/admin
git commit -m "feat(admin): menu Site, core de save de conteudo e campos reutilizaveis"
```

---

## Task 6: Seção Marca & Contatos (template das seções)

**Files:**
- Create: `platform/src/app/(admin)/admin/site/marca/page.tsx`
- Create: `platform/src/app/(admin)/admin/site/marca/actions.ts`
- Create: `platform/src/components/admin/site/MarcaForm.tsx`

- [ ] **Step 1: Action** — `actions.ts`:

```ts
"use server";
import { requireAdmin } from "@/lib/auth";
import { getConteudo } from "@/lib/site/content";
import { salvarConteudo, uploadSiteImagem } from "@/lib/site/save";

export type SecaoState = { ok?: boolean; erro?: string } | null;

export async function salvarMarca(_prev: SecaoState, fd: FormData): Promise<SecaoState> {
  await requireAdmin();
  const atual = await getConteudo("marca");
  async function up(campo: "logoGoldPath" | "logoNavyPath" | "faviconPath") {
    const f = fd.get(campo) as File | null;
    if (f && f.size > 0) { const r = await uploadSiteImagem(f); if (typeof r !== "string") return { erro: r.erro }; return r; }
    return atual[campo];
  }
  const logoGoldPath = await up("logoGoldPath"); if (typeof logoGoldPath !== "string") return logoGoldPath;
  const logoNavyPath = await up("logoNavyPath"); if (typeof logoNavyPath !== "string") return logoNavyPath;
  const faviconPath = await up("faviconPath"); if (typeof faviconPath !== "string") return faviconPath;
  const valor = {
    logoGoldPath, logoNavyPath, faviconPath,
    rodapeTagline: String(fd.get("rodapeTagline") ?? "").trim(),
    instagramUrl: String(fd.get("instagramUrl") ?? "").trim(),
    instagramHandle: String(fd.get("instagramHandle") ?? "").trim(),
    cidadeUf: String(fd.get("cidadeUf") ?? "").trim(),
  };
  return salvarConteudo("marca", valor);
}
```

- [ ] **Step 2: Form** — `MarcaForm.tsx` (client, `useActionState(salvarMarca, null)`): `ImageField` para logoGold/logoNavy/favicon (mostrando a imagem atual via `imagemUrl`), `TextField` para tagline/instagramUrl/instagramHandle/cidadeUf, botão Salvar com estado `pending` e mensagem ok/erro. Reaproveitar componentes da Task 5.

- [ ] **Step 3: Page** — `marca/page.tsx` (server): `const marca = await getConteudo("marca")`; renderizar `<MarcaForm inicial={marca} />` dentro do chrome admin.

- [ ] **Step 4: Verificar** — `npm run build`; salvar a seção altera header/footer no site (revalidação).

- [ ] **Step 5: Commit**

```bash
git add platform/src/app/"(admin)"/admin/site/marca platform/src/components/admin/site/MarcaForm.tsx
git commit -m "feat(admin): secao Site > Marca & Contatos (upload de logos/favicon)"
```

---

## Task 7: Seção Home

**Files:**
- Create: `platform/src/app/(admin)/admin/site/home/{page.tsx,actions.ts}`
- Create: `platform/src/components/admin/site/HomeForm.tsx`

- [ ] **Step 1: Action `salvarHome`** — mesmo padrão da Task 6 (`requireAdmin` → montar `valor` → `salvarConteudo("home", valor)`). Campos: `eyebrow`, `heroTitulo`, `heroTituloEnfase`, `heroTituloFim`, `heroSubtitulo` (textarea), `ctaPrimarioLabel/Href`, `ctaSecundarioLabel/Href`, `seoTitle`, `seoDescription`. O array `blocos` vem de um hidden JSON (`ListField`): `JSON.parse(String(fd.get("blocos") ?? "[]"))` validando que cada item tem `{titulo, texto}`.

- [ ] **Step 2: Form `HomeForm.tsx`** — `TextField`/`TextareaField` para os campos simples + `ListField` para `blocos` (itens `{titulo, texto}`, add/remover/reordenar), `useActionState(salvarHome, null)`.

- [ ] **Step 3: Page** — carrega `getConteudo("home")` e renderiza o form.

- [ ] **Step 4: Verificar** — `npm run build`; editar textos do hero e blocos reflete em `/`.

- [ ] **Step 5: Commit**

```bash
git add platform/src/app/"(admin)"/admin/site/home platform/src/components/admin/site/HomeForm.tsx
git commit -m "feat(admin): secao Site > Home (hero, CTAs, blocos, SEO)"
```

---

## Task 8: Seções Instituto e Camila

**Files:**
- Create: `platform/src/app/(admin)/admin/site/instituto/{page.tsx,actions.ts}` + `InstitutoForm.tsx`
- Create: `platform/src/app/(admin)/admin/site/camila/{page.tsx,actions.ts}` + `CamilaForm.tsx`

- [ ] **Step 1: Instituto** — action `salvarInstituto`: upload de `fotoPath` (padrão da Task 6, campo único; preserva o atual se não enviar) + campos `eyebrow`, `titulo`, `subtitulo`, `frentesTitulo`, `seoTitle`, `seoDescription` + arrays via hidden JSON: `frentes` (`{destaque, texto}`), `secoes` (`{titulo, paragrafos: string[]}`), e `cta` (`{label, href}`). `salvarConteudo("instituto", valor)`.

- [ ] **Step 2: Instituto form/page** — `InstitutoForm.tsx` com `ImageField` da foto (preview via `imagemUrl(instituto.fotoPath, "/fotos/camila-2.jpg")`), os campos de texto, `TextField` do CTA (label/href) e `ListField` de `frentes` e `secoes`; `page.tsx` carrega `getConteudo("instituto")`.

- [ ] **Step 3: Camila** — action `salvarCamila`: upload de `fotoPath` (padrão da Task 6, campo único), campos `eyebrow`, `nome`, `resumo` (textarea), `seoTitle`, `seoDescription`, arrays `formacao` (string[]), `secoes` (`{titulo, paragrafos}`), `ctas` (`{label, href, variant}`) via hidden JSON. `salvarConteudo("camila", valor)`.

- [ ] **Step 4: Camila form/page** — `CamilaForm.tsx` com `ImageField` da foto (preview via `imagemUrl(camila.fotoPath, "/fotos/camila-1.jpg")`), campos e `ListField`s; `page.tsx` carrega `getConteudo("camila")`.

- [ ] **Step 5: Verificar** — `npm run build`; editar reflete em `/instituto` e `/camila`.

- [ ] **Step 6: Commit**

```bash
git add platform/src/app/"(admin)"/admin/site/instituto platform/src/app/"(admin)"/admin/site/camila platform/src/components/admin/site
git commit -m "feat(admin): secoes Site > Instituto e Camila (com foto e listas)"
```

---

## Task 9: Seção Contato + SEO do FAQ

**Files:**
- Create: `platform/src/app/(admin)/admin/site/contato/{page.tsx,actions.ts}` + `ContatoForm.tsx`

- [ ] **Step 1: Action `salvarContato`** — campos `eyebrow`, `titulo`, `textoAcesso` (textarea), `seoTitle`, `seoDescription` + `canais` (hidden JSON, itens `{label, valor, href?}`). `salvarConteudo("contato", valor)`.

- [ ] **Step 2: Form/page** — `ContatoForm.tsx` com campos + `ListField` de canais; `page.tsx` carrega `getConteudo("contato")`.

- [ ] **Step 3: SEO do FAQ** — na mesma página (ou em `site/faq/page.tsx` da Task 10), incluir um mini-form salvando `seoTitle`/`seoDescription` via `salvarConteudo("faq", {...})`. (Deixar junto do CRUD do FAQ na Task 10 para coesão — implementar aqui apenas se conveniente; caso contrário, mover para a Task 10.)

- [ ] **Step 4: Verificar** — `npm run build`; editar reflete em `/contato`.

- [ ] **Step 5: Commit**

```bash
git add platform/src/app/"(admin)"/admin/site/contato platform/src/components/admin/site/ContatoForm.tsx
git commit -m "feat(admin): secao Site > Contato"
```

---

## Task 10: FAQ (CRUD) + SEO

**Files:**
- Create: `platform/src/app/(admin)/admin/site/faq/{page.tsx,actions.ts}` + `FaqForm.tsx`

- [ ] **Step 1: Actions** — `actions.ts` no padrão Depoimentos:
  - `salvarFaqItem(_prev, fd)`: `requireAdmin`; campos `id?`, `pergunta`, `resposta`, `ordem` (number), `ativo` (bool). `insert`/`update` em `faq_items`; `registrarAcao`; `revalidatePath("/admin/site/faq")` e `revalidatePath("/faq")`.
  - `excluirFaqItem(fd)`: `requireAdmin`; delete por `id`; auditoria; revalidate.
  - `salvarFaqSeo(_prev, fd)`: `salvarConteudo("faq", { seoTitle, seoDescription })`.

- [ ] **Step 2: Page** — `faq/page.tsx` (server): lista `faq_items` (todos, ordem asc) com form de edição por item (`<details>` como em outras telas), form "novo item", form de exclusão, e o mini-form de SEO. Reaproveitar `FaqForm.tsx` para criar/editar.

- [ ] **Step 3: Verificar** — `npm run build`; adicionar/editar/remover/reordenar perguntas reflete em `/faq`.

- [ ] **Step 4: Commit**

```bash
git add platform/src/app/"(admin)"/admin/site/faq platform/src/components/admin/site/FaqForm.tsx
git commit -m "feat(admin): secao Site > FAQ (CRUD + SEO)"
```

---

## Task 11: Verificação de fechamento e push

- [ ] **Step 1: Testes** — `npx vitest run` → tudo verde (inclui `merge.test.ts`).
- [ ] **Step 2: Type-check + build** — `npx tsc --noEmit` e `npm run build` sem erros; confirmar rotas `/admin/site*` e as páginas institucionais no output.
- [ ] **Step 3: Sanidade de conteúdo** — sem salvar nada no admin, o site deve mostrar exatamente o conteúdo atual (defaults). Depois, salvar uma seção e confirmar que muda no site.
- [ ] **Step 4: Push**

```bash
git push origin main
```

- [ ] **Step 5:** Confirmar deploy READY na Vercel e checar `/admin/site` e uma página institucional no ar.

---

## Notas de implementação (DRY / YAGNI / convenções)

- Reusar SEMPRE: `requireAdmin()`, `registrarAcao()`, `montarNomeArquivo()`, `revalidatePath`, e os componentes de campo da Task 5.
- Server Actions retornam `{ ok } | { erro }` e os forms usam `useActionState` + estado `pending` (padrão das telas atuais).
- Uploads sempre no bucket `capas`, subpasta `site/`.
- Nunca renderizar vazio: toda leitura passa por `getConteudo`/`getFaq` com fallback aos defaults.
- Páginas com parênteses no caminho: citar entre aspas no `git add`.

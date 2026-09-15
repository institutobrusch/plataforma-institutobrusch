# Instituto Brusch — Briefing de Design para o V0

> Cole este documento inteiro no V0 (v0.dev). Ele descreve fielmente todas as páginas, o
> sistema de design, os componentes e os dados de exemplo da plataforma. Peça ao V0 para
> gerar em **Next.js (App Router) + Tailwind CSS + shadcn/ui**, tema claro/escuro,
> mobile-first e responsivo.

---

## 0. Visão geral do produto

Plataforma web do **Instituto Brusch** — centro de psicologia, terapia sistêmica e
autoconhecimento em **Palmas, Tocantins**, liderado pela psicóloga **Camila de Menezes Brusch**.
Frentes: psicoterapia clínica, **O Círculo** (terapia em grupo) e **Cartografia** (acompanhamento
mensal por leitura de cartas, com áudios e resumos das sessões).

É um **site institucional + área de membros logada** (a "Cartografia"). Todos os dados são
fictícios e os fluxos (inscrição, contratação, login, pagamento) são **simulados** — nada é
gravado nem cobrado. É uma demonstração navegável de alta fidelidade.

Tom da marca: **cuidado + profundidade + credibilidade clínica**. "Clínico premium",
muito branco, verde pinho escuro, sem cara de template genérico, sem misticismo exagerado.

---

## 1. Sistema de design (tokens exatos)

### Tipografia (Google Fonts)
- **Títulos e corpo:** `Libre Franklin` (pesos 400, 500, 600, 700, 800) — fallback `system-ui, -apple-system, sans-serif`.
- **Acentos em itálico** (uma palavra no hero, citações, recomendação da carta): `Newsreader` itálico (400/500) — fallback `Georgia, serif`.
- Títulos: `font-weight:700; line-height:1.12; letter-spacing:-.02em; text-wrap:balance`.
- `.lead` (subtítulo): `1.14rem; line-height:1.6; max-width:60ch; cor ink-2`.
- `.eyebrow` (rótulo acima do título): `0.72rem; letter-spacing:.22em; UPPERCASE; weight 700; cor verde-claro`.
- `.serif-i`: Newsreader itálico (destaque dentro de títulos).

### Cores — tema claro (`:root`)
```
--bg:      #FBFAF7   (fundo off-white)
--surface: #FFFFFF   (cards)
--surface-2:#F3F2EC
--line:    #E4E2D8   (bordas)
--ink:     #22261F   (texto principal)
--ink-2:   #575B4F   (texto secundário)
--ink-3:   #8A8D80   (texto terciário / captions)
--green:   #33463A   (verde pinho — cor primária, botões)
--green-d: #243228   (verde escuro — hover, faixas, CTA)
--green-l: #6E8A73   (verde claro — eyebrow, destaques)
--sage:    #86A08C   (aspas decorativas)
--sage-bg: #E8EDE8   (fundos suaves, chips, pills presencial)
--gold:    #AE8A52   (dourado discreto — só na área de Cartografia)
```

### Cores — tema escuro (`@media prefers-color-scheme:dark` e `[data-theme="dark"]`)
```
--bg:#181A16  --surface:#20231D  --surface-2:#262A20  --line:#33372C
--ink:#EDEDE4  --ink-2:#B6B9AC  --ink-3:#868A7B
--green:#8CA07E  --green-d:#728A66  --green-l:#A6B899  --sage:#8CA07E
--sage-bg:#242A1E  --gold:#C6A374
```
> Toggle explícito deve vencer o sistema (guardar `:root:not([data-theme="light"])` no media dark).

### Layout / formas
- Largura máxima do conteúdo: `--wrap: 1160px` com padding lateral `26px`.
- Raio de card: `10px` (`--r`); botões/pílulas: `999px`; modais: `16px`.
- Sombra card: `0 20px 50px -34px rgba(34,38,31,.55)`; sombra suave: `0 6px 20px -14px rgba(34,38,31,.4)`.
- Espaçamento vertical de seção (`.pad`): ~88px (56px no mobile).
- Grids: `.g3` (3 col → 2 → 1), `.g2` (2 col → 1), `.split` (0.82fr / 1.18fr → 1 col em ≤860px).

### Componentes base
- **Botão** `.btn`: fundo verde, texto branco, borda 1.6px verde, `padding:.72em 1.5em`, raio 999px; hover escurece p/ green-d e sobe 1px. Variante `.ghost`: transparente, texto verde, hover fundo sage-bg.
- **Pill de evento**: `.pres` (fundo sage-bg, texto verde) e `.online` (fundo dourado 16%, texto dourado).
- **Chip de filtro**: cápsula; ativo = fundo verde, texto branco.
- **Card**: fundo surface, borda `--line`, raio 10px, sombra suave; imagem topo em `aspect-ratio` (poster 1/1 nos eventos).
- **Foco visível**: `outline 2.5px verde-claro, offset 3px`.

---

## 2. Navegação (header sticky)

Header fixo no topo, fundo translúcido do `--bg` (blur), borda inferior `--line`.
- **Brand** (esquerda): logo 40×40 + duas linhas: eyebrow "INSTITUTO" (0.7rem, tracking .24em, verde) sobre "Brusch" (1.05rem, 700).
- **Nav-links** (direita): Início · O Instituto · Camila Brusch · Eventos · Blog · Depoimentos · Comunidade. Link ativo em verde/600.
- **Toggle de tema** (ícone) + **hambúrguer** no mobile (`≤940px` vira menu vertical full-width).

Roteamento por seções (SPA) — no V0, gere como **rotas Next**: `/`, `/instituto`, `/camila`,
`/eventos`, `/eventos/[id]`, `/blog`, `/blog/[id]`, `/cartografia`, `/cartografia/app` (área logada),
`/depoimentos`, `/comunidade`.

---

## 3. Páginas (estrutura fiel)

### 3.1 Início (`/`)
1. **Hero full-bleed**: foto real de uma roda de terapia em grupo ocupando toda a largura, com
   gradiente escurecendo à esquerda (`linear-gradient(90deg, bg→transparente)`) + leve tint verde
   (`mix-blend-mode:color; opacity .2`). Texto sobreposto à ESQUERDA (max 520px):
   - eyebrow "Palmas · Tocantins"
   - H1: **"Cuidar de vínculos é _transformar_ histórias."** (a palavra "transformar" em Newsreader itálico, cor verde-claro)
   - lead: "A terapia em grupo é um espaço de escuta, aprendizado e apoio para viver com mais leveza e propósito."
   - CTAs: botão primário + ghost.
2. **Faixa de 4 pilares** (fundo verde `--green`, texto claro), grid 4 col → 2 → 1, cada um com ícone linear:
   - Segurança e Confiança — "Ambiente estruturado, ético e confidencial."
   - Profissionais Qualificados — "Equipe interdisciplinar com ampla experiência."
   - Grupos para Diferentes Necessidades — "Temas e formatos que atendem diversos objetivos."
   - Transformação que Gera Impacto — "Mais consciência, escolhas saudáveis e relações melhores."
3. **Próximos encontros**: cabeçalho (eyebrow "Agenda" + H2) + grid de 3 cards de evento (ver §4).
4. **Sobre** (`.split`): à esquerda uma **foto polaroid** real (roda/Círculo); à direita eyebrow "Sobre",
   H2 "Um cuidado com profundidade e método", lead sobre unir rigor clínico + autoconhecimento em grupo.
5. **Depoimentos em destaque**: eyebrow "Histórias" + H2 "O que dizem quem passou por aqui" + carrossel/grid de citações.
6. **CTA-strip** (fundo green-d, centralizado): "A sua Cartografia começa com um encontro" + botão.
7. **Footer** (ver §6).

### 3.2 O Instituto (`/instituto`)
`.split`: coluna esquerda com **factbox** ("Nossas frentes") + **foto real** (silhueta, posição 45%).
Coluna direita (prose):
- eyebrow "Sobre", H2 "O Instituto Brusch"
- lead: "Um centro integrado de saúde mental e autoconhecimento em Palmas (TO), onde a psicoterapia encontra a expansão de consciência."
- H3 "Pensamento sistêmico" + parágrafo; H3 "Expansão de consciência" + parágrafo.
- CTA "Ver encontros".

### 3.3 Camila Brusch (`/camila`)
`.split`: esquerda factbox "Formação & atuação" + **foto profissional real da Camila** (posição center 28%).
Direita: eyebrow "A idealizadora", H2 "Camila Brusch", lead "Psicóloga clínica, terapeuta sistêmica
e idealizadora do Instituto Brusch.", H3 "Uma escuta que acolhe" + texto de bio.

### 3.4 Eventos (`/eventos`)
- eyebrow "Agenda", H2 (2.4rem) "Eventos & vivências", lead sobre presencial em Palmas + online.
- **Chips de filtro**: Todos / Presencial / Online.
- Grid `.g3` de cards de evento (§4). Card → página de detalhe.

**Detalhe do evento** (`/eventos/[id]`): imagem/poster grande, pill do tipo, H2 do título, meta
(data · local · vagas), lead com descrição, box lateral com Valor (R$ ou "Gratuito") + botão
**Inscrever-se** → modal fluxo simulado: dados → "pagamento" → tela de sucesso ✓ "Inscrição confirmada!".

### 3.5 Blog (`/blog`)
- eyebrow "Leituras", H2 "Blog do Instituto", lead "Textos da Camila, do instituto e de colunistas convidados."
- Grid de cards: cada card mostra `data · autor`, título, resumo. Detalhe (`/blog/[id]`): eyebrow com data,
  H2 grande (clamp 1.9–2.7rem), corpo em parágrafos, assinatura autor/cargo.

### 3.6 Depoimentos (`/depoimentos`)
- eyebrow "Histórias", H2 "Depoimentos". **Masonry** (colunas 3 → 2 → 1) de cartões de citação:
  aspas decorativas (Newsreader, cor sage), texto em serif, avatar circular com iniciais + nome + papel.

### 3.7 Comunidade & Grupos (`/comunidade`)
- eyebrow "Membros", H2 "Comunidade & Grupos", lead. Duas colunas:
  - **Grupos do instituto** (lista com ícone 50px, título, descrição).
  - **Conversas recentes** (threads: avatar+nome, "há Xh", texto, reações ♥ likes · 💬 comentários).

### 3.8 Cartografia — landing (`/cartografia`)
- `.split`: eyebrow "Autoconhecimento", H2 "A sua Cartografia", lead: "Um acompanhamento contínuo a
  partir da sua carta: leituras mensais, áudios e resumos das sessões — um mapa vivo do seu momento.
  A carta não prevê o futuro; ela ilumina o presente."
- 3 features (ícone + título + texto): **A carta** / **Áudios & resumos** / **Recomendação mensal**.
- CTA-strip "Como funciona o acesso" com botões **Contratar minha cartografia** (modal simulado) e
  **Entrar** (login demo → área logada em 1 clique).

### 3.9 Cartografia — área logada (`/cartografia/app`)
Layout `.app` = **sidebar 248px + conteúdo** (vira 1 coluna ≤820px).
- **Sidebar** (fundo green-d, texto claro): bloco do usuário (avatar dourado + nome), menu vertical
  (Minha Cartografia, Sessões, Comunidade), botão "↩ Sair da área".
- **Conteúdo**:
  - "Bem-vinda de volta," + nome.
  - **Stat-row** (3 stats, número verde grande + label uppercase): `3 Sessões registradas` · `Set Recomendação atual` · `2 Meses de jornada`.
  - **Sua carta** (`.cart-top`, 300px + texto): imagem da carta + eyebrow "Sua carta" + H3 "O Mapa da Reconstrução" + explicação dos três campos.
  - **Tópicos** (chips sage-bg/verde): Vínculos · Autoconhecimento · Ciclos · Presença · Escuta interna.
  - **Recomendação do mês** (box `.reco`: gradiente sage→surface, borda esquerda dourada 4px): eyebrow dourado
    "Recomendação do mês", H2 "Setembro de 2026", citação em serif itálico.
  - **Sessões & áudios**: lista de encontros, cada um com **player de áudio** (play, barra, tempo), título,
    data, duração e **resumo em texto** expansível.
  - **Comunidade da Cartografia**: threads dos membros (mesmo padrão da §3.7).

---

## 4. Card de evento (componente)

- Topo: **poster** em `aspect-ratio:1/1` (background-image cover) quando há imagem; senão bloco em
  gradiente verde. Pill do tipo no canto (Presencial = sage; Online = dourado).
- Corpo: H3 título + meta (data). Card inteiro clicável para o detalhe.

---

## 5. Dados de exemplo (use exatamente estes)

### Eventos
| id | título | tipo | data | local | preço | vagas |
|---|---|---|---|---|---|---|
| circulo-out | O Círculo · Turma de Outubro | Presencial | 18 out 2026, 19h | Sede do Instituto — Palmas/TO | R$180 | 6 vagas |
| vivencia-sistemica | Vivência: Minha história familiar | Presencial | 25 out 2026, 9h | Espaço Semente — Palmas/TO | R$240 | 12 vagas |
| live-ansiedade | Online: Ansiedade e presença | Online | 30 out 2026, 20h | Ao vivo pela plataforma | Gratuito | Aberto |
| circulo-online | O Círculo Online · Novembro | Online | 8 nov 2026, 19h | Ao vivo pela plataforma | R$150 | 10 vagas |
| retiro | Retiro de Autoconhecimento | Presencial | 6 dez 2026, dia inteiro | Serra do Lajeado — TO | R$520 | 20 vagas |
| workshop-cartas | Online: Introdução à Cartografia | Online | 12 dez 2026, 20h | Ao vivo pela plataforma | R$90 | Aberto |

Descrições (exemplos): retiro → "Um dia de silêncio, natureza e vivências guiadas para reencontrar o
próprio centro. Inclui almoço e material." · workshop-cartas → "Entenda o que é a cartografia do
instituto e como ela pode ser um mapa para o seu momento de vida."

### Posts do blog
1. **O que acontece dentro de O Círculo** — Instituto Brusch (Equipe) · 21 ago 2026 — "Como funciona a terapia em grupo aberta e por que o encontro com o outro cura."
2. **Cartografia: um mapa para o seu momento** — Camila Brusch (Psicóloga · fundadora) · 5 ago 2026 — "A carta não prevê o futuro — ela ilumina o presente."
3. **O corpo também lembra** — Dra. Helena Prado (Colunista convidada) · 18 jul 2026 — "Sobre a memória do corpo e o cuidado integral."

### Depoimentos
- Marina L. (Participante de O Círculo) — "O Círculo mudou a forma como me relaciono com a minha família. Saí de cada encontro mais leve."
- Rafael S. (Cliente da Cartografia) — "A cartografia virou meu ritual mensal. Os áudios da Camila me acompanham nas semanas difíceis."
- Juliana P. (Participante de vivência) — "Nunca imaginei que um grupo pudesse ser tão seguro. Encontrei acolhimento e me encontrei."
- André M. (Terapia sistêmica) — "Entendi padrões que eu repetia sem perceber."
- Camila R. (Vivência familiar) — "A vivência sobre história familiar foi um divisor de águas."
- Bruno T. (O Círculo Online) — "Faço o Círculo Online de outra cidade e me sinto tão presente quanto na sala."
- Letícia F. (Cliente da Cartografia) — "A recomendação mensal da minha carta sempre chega no momento certo."

### Grupos da comunidade
- Membros de O Círculo — "Grupo dos participantes dos ciclos presenciais e online."
- Cartografia — leituras — "Trocas sobre as cartas e as recomendações do mês."
- Autoconhecimento diário — "Práticas, indicações e apoio entre os encontros."

### Threads (conversas)
- Marina L. · há 2h — "Alguém mais sentiu a recomendação desse mês bem certeira?..." (12 ♥ · 4 💬)
- André M. · há 1 dia — "Voltando do último Círculo com o coração cheio..." (23 ♥ · 7 💬)
- Juliana P. · há 3 dias — "Dica: ouvir o áudio da sessão caminhando de manhã..." (18 ♥ · 5 💬)

### Sessões da cartografia (área logada)
1. **Encontro 03 · Os vínculos que nos formam** — 28 ago 2026 · 42:10 — resumo sobre apego, expectativa, cuidar × controlar.
2. **Encontro 02 · A história por trás do sintoma** — 14 ago 2026 · 38:47 — sintomas como mensagens, lealdade familiar.
3. **Encontro 01 · Boas-vindas ao seu mapa** — 31 jul 2026 · 29:33 — abertura do ciclo, apresentação da carta.

### Tópicos da carta
Vínculos · Autoconhecimento · Ciclos · Presença · Escuta interna

### Carta atual
"O Mapa da Reconstrução" — recomendação de Setembro de 2026.

---

## 6. Footer
Fundo verde-escuro, grid `1.5fr 1fr 1fr`: coluna da marca (logo + nome + descrição curta),
coluna de links de navegação, coluna de contato (Instagram @institutobrusch, Palmas/TO).

---

## 7. Instruções finais para o V0
- Gere em **Next.js App Router + TypeScript + Tailwind + shadcn/ui**.
- Implemente o **tema claro/escuro** com os tokens acima como CSS variables (não hardcode cores).
- **Mobile-first**; teste em ~400px de largura.
- Use **imagens placeholder** (royalty-free) onde eu indiquei "foto real" — depois eu substituo pelas fotos do instituto.
- Fluxos de inscrição / contratação / login / pagamento são **modais simulados** que terminam numa tela de sucesso ✓ (nada de backend).
- Mantenha a estética **clínica premium**: muito branco, verde pinho, dourado só na Cartografia, tipografia Libre Franklin + Newsreader itálico nos acentos.

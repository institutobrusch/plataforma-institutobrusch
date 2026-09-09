# Instituto Brusch — Demo navegável (protótipo para reunião)

**Data:** 2026-09-09
**Status:** Spec aprovado (design validado com o usuário)
**Objetivo:** Protótipo navegável de alta fidelidade para apresentar em reunião com a idealizadora, Camila Brusch. NÃO é o produto final — é uma demo que comunica a visão da plataforma.

## Contexto

O Instituto Brusch (Palmas/TO) é liderado pela psicóloga Camila de Menezes Brusch. Atua em saúde mental, psicoterapia sistêmica e autoconhecimento/expansão de consciência. Frentes conhecidas: "O Círculo" (terapia em grupo), atendimento clínico/sistêmico e **cartografia** (leitura de cartas com acompanhamento).

## Escopo desta entrega

Uma **single-page application (SPA)** publicada como Artifact (link compartilhável, abre em celular e notebook). Todos os dados são **fictícios/mock**; fluxos de inscrição, contratação, login e pagamento são **simulados** (mostram a experiência, não gravam nem cobram nada).

Fora de escopo (fase 2): backend real, autenticação real, banco de dados, gateway de pagamento, upload de mídia real.

## Direção visual

- **Base terrosa e acolhedora:** areia, terracota, verde-oliva, off-white; tipografia serifada elegante para títulos + sans humanista para texto.
- **Acentos celestes (índigo/dourado discreto)** reservados **apenas à área de Cartografia**, para diferenciar a experiência das cartas sem deixar o site inteiro "esotérico".
- Tom: cuidado + profundidade + credibilidade clínica. Evitar frieza clínica e misticismo exagerado.
- Tema claro; responsivo (mobile-first, pois será mostrado no celular).

## Mapa do site

### Área pública (visitante)
1. **Início** — hero com proposta do instituto; destaques: próximo evento, chamada para O Círculo, depoimento em destaque; CTAs.
2. **O Instituto** — sobre, missão, frentes de atuação (O Círculo, clínico/sistêmico).
3. **Camila Brusch** — bio, formação (PUC-RS, especializações), atuação clínica e pública.
4. **Eventos** — lista com filtro **Presencial / Online**; página de detalhe por evento com botão **Inscrever-se** (fluxo simulado: dados → "pagamento" → confirmação).
5. **Cartografia** — página de venda/explicação (o que é, como funciona, contratar — fluxo simulado) + porta de entrada para a área do cliente.
6. **Blog** — posts com autor (Camila, instituto, colunistas); lista + post individual.
7. **Depoimentos** — mural de depoimentos.
8. **Comunidade / Grupos** — apresentação + acesso aos grupos.
9. **Rodapé/Contato** — Instagram e canais.

### Área logada (cliente da cartografia)
- Acesso via **"entrar como cliente demo"** (1 clique, preenche credenciais e entra).
- **Minha Cartografia:** a carta (imagem), explicação da carta, principais tópicos, **recomendação do mês**, e lista de **encontros/sessões** com **áudio (player)** + **resumo em texto**.
- **Comunidade dos membros:** espaço de troca (mock de posts/threads).

## Arquitetura técnica (demo)

- SPA client-side, roteamento por estado/hash (sem backend).
- Camada de **dados mock** centralizada (eventos, posts, depoimentos, carta, sessões, membros).
- Componentes reutilizáveis: navbar, hero, cards (evento/post/depoimento), modal de fluxo (inscrição/contratação/login), player de áudio, layout da área logada.
- "Autenticação" simulada: estado em memória; botão de atalho demo.
- Áudios: usar um arquivo curto/placeholder ou player com faixa de exemplo.

## Critérios de sucesso

- Abre por link no celular e no notebook, sem instalar nada.
- Todas as 9 seções públicas navegáveis + área logada acessível em 1 clique.
- Fluxos de inscrição, contratação e login demonstráveis (simulados) sem erros.
- Visual coeso e "vendável" que faça a Camila enxergar a plataforma pronta.

## Fase 2 (pós-aprovação, fora desta entrega)

Migração para projeto React + Vite com backend real (Supabase: auth, banco, storage para áudios/cartas, RLS por cliente), pagamentos (ex.: Stripe/Pagar.me), e painel administrativo para a Camila lançar eventos, cartas e posts.

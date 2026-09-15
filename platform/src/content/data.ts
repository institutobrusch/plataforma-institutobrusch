import type { Evento, Post, Depoimento, Grupo, FaqItem, Ebook, Curso } from "./types";

// Seed portado do protótipo aprovado (web/index.html).
// Será migrado para o Supabase na Etapa 2 e editável no admin (Etapa 5).

export const EVENTOS: Evento[] = [
  {
    slug: "circulo-out",
    titulo: "O Círculo · Turma de Outubro",
    tipo: "Presencial",
    data: "18 out 2026, 19h",
    local: "Sede do Instituto — Palmas/TO",
    preco: 180,
    vagas: "6 vagas",
    descricao:
      "Quatro encontros em grupo reduzido para escutar e ser escutado. Um ciclo presencial de terapia em grupo conduzido pela Camila, com temas que emergem do próprio grupo.",
  },
  {
    slug: "vivencia-sistemica",
    titulo: "Vivência: Minha história familiar",
    tipo: "Presencial",
    data: "25 out 2026, 9h",
    local: "Espaço Semente — Palmas/TO",
    preco: 240,
    vagas: "12 vagas",
    descricao:
      "Uma vivência guiada para olhar os padrões que se repetem na sua história familiar — lealdades invisíveis, papéis herdados e o que pede reorganização.",
  },
  {
    slug: "live-ansiedade",
    titulo: "Online: Ansiedade e presença",
    tipo: "Online",
    data: "30 out 2026, 20h",
    local: "Ao vivo pela plataforma",
    preco: 0,
    vagas: "Aberto",
    descricao:
      "Um encontro online e gratuito sobre como a ansiedade se manifesta e práticas simples para voltar ao presente. Aberto à comunidade.",
  },
  {
    slug: "circulo-online",
    titulo: "O Círculo Online · Novembro",
    tipo: "Online",
    data: "8 nov 2026, 19h",
    local: "Ao vivo pela plataforma",
    preco: 150,
    vagas: "10 vagas",
    descricao:
      "A experiência do Círculo em formato online, para quem está fora de Palmas. Quatro encontros semanais em grupo reduzido.",
  },
  {
    slug: "retiro",
    titulo: "Retiro de Autoconhecimento",
    tipo: "Presencial",
    data: "6 dez 2026, dia inteiro",
    local: "Serra do Lajeado — TO",
    preco: 520,
    vagas: "20 vagas",
    descricao:
      "Um dia de silêncio, natureza e vivências guiadas para reencontrar o próprio centro. Inclui almoço e material.",
  },
  {
    slug: "workshop-cartas",
    titulo: "Online: Introdução à Cartografia",
    tipo: "Online",
    data: "12 dez 2026, 20h",
    local: "Ao vivo pela plataforma",
    preco: 90,
    vagas: "Aberto",
    descricao:
      "Entenda o que é a cartografia do instituto e como ela pode ser um mapa para o seu momento de vida.",
  },
];

export const POSTS: Post[] = [
  {
    slug: "o-circulo",
    titulo: "O que acontece dentro de O Círculo",
    autor: "Instituto Brusch",
    cargo: "Equipe",
    data: "21 ago 2026",
    resumo:
      "Como funciona a terapia em grupo aberta e por que o encontro com o outro cura.",
    corpo: [
      "O Círculo é um espaço de escuta em grupo reduzido. Não há palestra — há presença.",
      "Ao ouvir o outro, reconhecemos partes de nós mesmos que estavam no escuro. O grupo vira espelho e sustentação.",
      "Cada ciclo tem quatro encontros, com temas que emergem do próprio grupo.",
    ],
  },
  {
    slug: "cartografia-mapa",
    titulo: "Cartografia: um mapa para o seu momento",
    autor: "Camila Brusch",
    cargo: "Psicóloga · fundadora",
    data: "5 ago 2026",
    resumo:
      "A carta não prevê o futuro — ela ilumina o presente. Entenda a proposta.",
    corpo: [
      "A cartografia do instituto é uma ferramenta de autoconhecimento, não de adivinhação.",
      "A partir da sua carta, construímos leituras mensais, áudios e resumos que acompanham o seu processo ao longo do tempo.",
      "É um mapa vivo: muda conforme você caminha.",
    ],
  },
  {
    slug: "coluna-corpo",
    titulo: "O corpo também lembra",
    autor: "Dra. Helena Prado",
    cargo: "Colunista convidada",
    data: "18 jul 2026",
    resumo:
      "Colunista convidada escreve sobre a memória do corpo e o cuidado integral.",
    corpo: [
      "O que a mente esquece, o corpo às vezes guarda. Tensões, dores e sintomas podem ser mensagens.",
      "Cuidar da saúde mental é também escutar o corpo — e devolver a ele um lugar na conversa terapêutica.",
    ],
  },
];

export const DEPOIMENTOS: Depoimento[] = [
  { nome: "Marina L.", contexto: "Participante de O Círculo", texto: "O Círculo mudou a forma como me relaciono com a minha família. Saí de cada encontro mais leve.", iniciais: "ML" },
  { nome: "Rafael S.", contexto: "Cliente da Cartografia", texto: "A cartografia virou meu ritual mensal. Os áudios da Camila me acompanham nas semanas difíceis.", iniciais: "RS" },
  { nome: "Juliana P.", contexto: "Participante de vivência", texto: "Nunca imaginei que um grupo pudesse ser tão seguro. Encontrei acolhimento e me encontrei.", iniciais: "JP" },
  { nome: "André M.", contexto: "Terapia sistêmica", texto: "Entendi padrões que eu repetia sem perceber. Recomendo demais o trabalho da Camila.", iniciais: "AM" },
  { nome: "Camila R.", contexto: "Vivência familiar", texto: "A vivência sobre história familiar foi um divisor de águas. Voltei transformada.", iniciais: "CR" },
  { nome: "Bruno T.", contexto: "O Círculo Online", texto: "Faço o Círculo Online de outra cidade e me sinto tão presente quanto na sala.", iniciais: "BT" },
  { nome: "Letícia F.", contexto: "Cliente da Cartografia", texto: "A recomendação mensal da minha carta sempre chega no momento certo.", iniciais: "LF" },
];

export const GRUPOS: Grupo[] = [
  { titulo: "Membros de O Círculo", descricao: "Grupo dos participantes dos ciclos presenciais e online." },
  { titulo: "Cartografia — leituras", descricao: "Trocas sobre as cartas e as recomendações do mês." },
  { titulo: "Autoconhecimento diário", descricao: "Práticas, indicações e apoio entre os encontros." },
];

export const FAQ: FaqItem[] = [
  { pergunta: "Como funciona O Círculo?", resposta: "É uma terapia em grupo reduzido, conduzida pela Camila, em ciclos de quatro encontros. Não há palestra — o foco é a escuta e a troca entre os participantes." },
  { pergunta: "A Cartografia é uma leitura de futuro?", resposta: "Não. A carta não prevê o futuro; ela ilumina o seu momento presente. É uma ferramenta de autoconhecimento com acompanhamento mensal (leituras, áudios e resumos)." },
  { pergunta: "Os encontros online são ao vivo?", resposta: "Sim, os encontros online acontecem ao vivo pela plataforma, com grupo reduzido para preservar a intimidade da experiência." },
  { pergunta: "Como faço para me inscrever em um evento?", resposta: "Na página do evento, clique em “Inscrever-se” e siga o passo a passo. Você recebe a confirmação e as instruções de acesso pela plataforma." },
  { pergunta: "Por quanto tempo os áudios das sessões ficam disponíveis?", resposta: "Os áudios e resumos das suas sessões ficam disponíveis na sua área da plataforma para revisitar quando quiser, enquanto seu acesso estiver ativo." },
];

// Exemplos de catálogo (serão cadastrados/editados no admin — Etapa 5)
export const EBOOKS: Ebook[] = [
  { slug: "ego-e-sombra", titulo: "Ego e Sombra", descricao: "Um convite a reconhecer as partes de si que vivem na sombra — e o que elas têm a ensinar.", preco: 39 },
  { slug: "dinamica-da-espiral", titulo: "A Dinâmica da Espiral", descricao: "Uma leitura sobre os ciclos do desenvolvimento humano e da consciência.", preco: 49 },
  { slug: "chaves-do-sucesso", titulo: "As Chaves do Sucesso", descricao: "Princípios para alinhar autoconhecimento, propósito e realização.", preco: 45 },
];

export const CURSOS: Curso[] = [
  { slug: "autoconhecimento-expansao", titulo: "Autoconhecimento e Expansão da Consciência", descricao: "Um percurso guiado para ampliar a forma como você se percebe e se relaciona com a própria história.", preco: 297, aulas: 8 },
  { slug: "paradigma-sistemico", titulo: "Expansão da Consciência pelo Paradigma Sistêmico", descricao: "Entenda os padrões sistêmicos que atravessam família, história e contexto.", preco: 347, aulas: 10 },
  { slug: "arquetipos", titulo: "Arquétipos", descricao: "Um mergulho nas imagens que habitam a psique e moldam nossas escolhas.", preco: 247, aulas: 6 },
];

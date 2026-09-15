import type {
  PensamentoDiario,
  ComunidadePostMock,
  SessaoMock,
  CartaMock,
} from "./types";

// Dados mock da área logada (demo). Migram para o Supabase na Etapa 3.

export const PENSAMENTOS: PensamentoDiario[] = [
  {
    data: "Hoje · 15 set 2026",
    titulo: "Comece pelo que é possível",
    duracao: "3:12",
    texto:
      "Nem todo dia pede grandes decisões. Às vezes, o cuidado é fazer a próxima coisa pequena com presença. Respire, escolha uma ação simples e permita-se recomeçar.",
  },
  {
    data: "14 set 2026",
    titulo: "O que o desconforto quer dizer",
    duracao: "4:05",
    texto:
      "O incômodo raramente é o inimigo — é um mensageiro. Antes de silenciá-lo, pergunte o que ele está tentando proteger em você.",
  },
  {
    data: "13 set 2026",
    titulo: "Vínculos que sustentam",
    duracao: "3:38",
    texto:
      "Reparar em quem te sustenta também é autoconhecimento. Hoje, agradeça mentalmente a uma pessoa que caminha com você.",
  },
];

export const COMUNIDADE: ComunidadePostMock[] = [
  { id: "p1", autor: "Marina L.", iniciais: "ML", tempo: "há 2h", texto: "Alguém mais sentiu o pensamento de hoje bem certeiro? Falou exatamente do que eu estava vivendo.", likes: 12, comentarios: 4 },
  { id: "p2", autor: "André M.", iniciais: "AM", tempo: "há 1 dia", texto: "Voltando do último Círculo com o coração cheio. Obrigado a todos que compartilharam.", likes: 23, comentarios: 7 },
  { id: "p3", autor: "Juliana P.", iniciais: "JP", tempo: "há 3 dias", texto: "Dica: ouvir o áudio da sessão caminhando de manhã tem sido transformador pra mim.", likes: 18, comentarios: 5 },
];

export const CARTA: CartaMock = {
  titulo: "O Mapa da Reconstrução",
  explicacao:
    "Sua carta reúne três campos que conversam entre si: o que pede acolhimento, o que pede movimento e o que pede paciência. Ela não prevê o futuro — ilumina o seu momento presente e orienta as leituras dos próximos meses.",
  topicos: ["Vínculos", "Autoconhecimento", "Ciclos", "Presença", "Escuta interna"],
};

export const SESSOES: SessaoMock[] = [
  {
    titulo: "Encontro 03 · Os vínculos que nos formam",
    data: "28 ago 2026",
    duracao: "42:10",
    resumo:
      "Exploramos como os primeiros vínculos moldam nossa forma de amar e de nos proteger. Falamos sobre apego, expectativa e a diferença entre cuidar e controlar.",
    materiais: [
      { titulo: "Exercício da semana (PDF)", tipo: "PDF" },
      { titulo: "Mapa de vínculos para imprimir", tipo: "PDF" },
    ],
  },
  {
    titulo: "Encontro 02 · A história por trás do sintoma",
    data: "14 ago 2026",
    duracao: "38:47",
    resumo:
      "Olhamos para os sintomas como mensagens, não como inimigos. Trouxemos a ideia de lealdade familiar e como certos padrões se repetem entre gerações.",
    materiais: [{ titulo: "Roteiro de reflexão (PDF)", tipo: "PDF" }],
  },
  {
    titulo: "Encontro 01 · Boas-vindas ao seu mapa",
    data: "31 jul 2026",
    duracao: "29:33",
    resumo:
      "A abertura do ciclo: apresentamos a sua carta e o sentido da cartografia como mapa vivo. Uma introdução ao trabalho que faremos juntos.",
    materiais: [],
  },
];

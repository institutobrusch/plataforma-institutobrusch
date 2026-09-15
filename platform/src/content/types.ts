export type EventoTipo = "Presencial" | "Online";

export interface Evento {
  slug: string;
  titulo: string;
  tipo: EventoTipo;
  data: string;
  local: string;
  preco: number; // 0 = gratuito
  vagas: string;
  descricao: string;
  posterUrl?: string;
}

export interface Post {
  slug: string;
  titulo: string;
  autor: string;
  cargo: string;
  data: string;
  resumo: string;
  corpo: string[];
  imagemUrl?: string;
}

export interface Depoimento {
  nome: string;
  contexto: string;
  texto: string;
  iniciais: string;
}

export interface Grupo {
  titulo: string;
  descricao: string;
}

export interface FaqItem {
  pergunta: string;
  resposta: string;
}

export interface Ebook {
  slug: string;
  titulo: string;
  descricao: string;
  preco: number;
  capaUrl?: string;
}

export interface Curso {
  slug: string;
  titulo: string;
  descricao: string;
  preco: number;
  aulas: number;
  capaUrl?: string;
}

// ----- Plataforma (área logada, dados mock da demo) -----
export interface PensamentoDiario {
  data: string;
  titulo: string;
  duracao: string;
  texto: string;
}

export interface ComunidadePostMock {
  id: string;
  autor: string;
  iniciais: string;
  tempo: string;
  texto: string;
  likes: number;
  comentarios: number;
}

export interface MaterialMock {
  titulo: string;
  tipo: string;
}

export interface SessaoMock {
  titulo: string;
  data: string;
  duracao: string;
  resumo: string;
  materiais: MaterialMock[];
}

export interface CartaMock {
  titulo: string;
  explicacao: string;
  topicos: string[];
}

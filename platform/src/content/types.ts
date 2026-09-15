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

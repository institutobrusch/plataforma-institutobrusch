import { EVENTOS, POSTS, DEPOIMENTOS, GRUPOS, FAQ, EBOOKS, CURSOS } from "./data";

export const getEventos = () => EVENTOS;
export const getEvento = (slug: string) => EVENTOS.find((e) => e.slug === slug);
export const getPosts = () => POSTS;
export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);
export const getDepoimentos = () => DEPOIMENTOS;
export const getGrupos = () => GRUPOS;
export const getFaq = () => FAQ;
export const getEbooks = () => EBOOKS;
export const getCursos = () => CURSOS;

import { PENSAMENTOS, COMUNIDADE, CARTA, SESSOES } from "./platform";
export const getPensamentos = () => PENSAMENTOS;
export const getComunidade = () => COMUNIDADE;
export const getCarta = () => CARTA;
export const getSessoes = () => SESSOES;

export * from "./types";

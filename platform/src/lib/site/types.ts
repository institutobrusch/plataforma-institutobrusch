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

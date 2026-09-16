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

import Link from "next/link";
import Image from "next/image";

const INSTITUCIONAL = [
  { href: "/instituto", label: "O Instituto" },
  { href: "/camila", label: "Camila Brusch" },
  { href: "/eventos", label: "Eventos" },
  { href: "/blog", label: "Blog" },
  { href: "/depoimentos", label: "Depoimentos" },
  { href: "/faq", label: "Perguntas frequentes" },
];

const PRODUTOS = [
  { href: "/cartografia", label: "Cartografia" },
  { href: "/cursos", label: "Cursos" },
  { href: "/ebooks", label: "E-books" },
  { href: "/comunidade", label: "Comunidade" },
];

function FooterCol({
  titulo,
  links,
}: {
  titulo: string;
  links: { href: string; label: string }[];
}) {
  return (
    <nav className="flex flex-col gap-2.5 text-sm">
      <span className="mb-1 text-xs font-semibold uppercase tracking-widest text-tan">
        {titulo}
      </span>
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="text-[color:#C7CDD8] transition hover:text-white">
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

export default function Footer() {
  return (
    <footer className="mt-auto border-t-2 border-[color:var(--tan)] bg-[color:var(--navy-d)] text-[color:#DCE1EA]">
      <div className="mx-auto grid max-w-[1160px] gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.1fr]">
        {/* Marca */}
        <div className="max-w-[34ch]">
          <Image
            src="/brand/logo-gold.png"
            alt="Instituto Brusch"
            width={180}
            height={51}
            className="h-11 w-auto"
          />
          <p className="mt-4 text-sm leading-relaxed text-[color:#AEB6C4]">
            Psicologia, terapia sistêmica e autoconhecimento em Palmas (TO).
            Psicoterapia, O Círculo e Cartografia.
          </p>
        </div>

        <FooterCol titulo="Institucional" links={INSTITUCIONAL} />
        <FooterCol titulo="Produtos" links={PRODUTOS} />

        {/* Contato */}
        <div className="flex flex-col gap-2.5 text-sm">
          <span className="mb-1 text-xs font-semibold uppercase tracking-widest text-tan">
            Contato
          </span>
          <a
            href="https://instagram.com/institutobrusch"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[color:#C7CDD8] transition hover:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
            @institutobrusch
          </a>
          <span className="text-[color:#AEB6C4]">Palmas · Tocantins</span>
          <Link
            href="/contato"
            className="mt-3 inline-flex w-fit items-center rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Acessar a plataforma
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1160px] flex-col gap-1 px-6 py-5 text-xs text-[color:#8E97A8] sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Instituto Brusch. Todos os direitos reservados.</span>
          <span>Palmas · Tocantins · Brasil</span>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import Image from "next/image";

const LINKS = [
  { href: "/instituto", label: "O Instituto" },
  { href: "/camila", label: "Camila Brusch" },
  { href: "/eventos", label: "Eventos" },
  { href: "/cartografia", label: "Cartografia" },
  { href: "/cursos", label: "Cursos" },
  { href: "/ebooks", label: "E-books" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "Perguntas frequentes" },
  { href: "/contato", label: "Contato" },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-[color:var(--navy-d)] text-[color:#DCE1EA]">
      <div className="mx-auto grid max-w-[1160px] gap-10 px-6 py-14 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Image
            src="/brand/logo-gold.png"
            alt="Instituto Brusch"
            width={170}
            height={48}
            className="h-11 w-auto"
          />
          <p className="mt-4 max-w-[38ch] text-sm text-[color:#AEB6C4]">
            Psicologia, terapia sistêmica e autoconhecimento em Palmas (TO).
            Psicoterapia, O Círculo e Cartografia.
          </p>
        </div>

        <nav className="flex flex-col gap-2 text-sm">
          <span className="mb-1 text-xs font-semibold uppercase tracking-widest text-[color:#8E97A8]">
            Navegação
          </span>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-[color:#C7CDD8] hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-2 text-sm">
          <span className="mb-1 text-xs font-semibold uppercase tracking-widest text-[color:#8E97A8]">
            Contato
          </span>
          <a
            href="https://instagram.com/institutobrusch"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[color:#C7CDD8] hover:text-white"
          >
            @institutobrusch
          </a>
          <span className="text-[color:#AEB6C4]">Palmas · Tocantins</span>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1160px] px-6 py-5 text-xs text-[color:#8E97A8]">
          © {new Date().getFullYear()} Instituto Brusch. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

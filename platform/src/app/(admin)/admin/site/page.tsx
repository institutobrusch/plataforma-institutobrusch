import Link from "next/link";

export const metadata = { title: "Site — Admin" };

const SECOES = [
  { href: "/admin/site/marca", titulo: "Marca & Contatos", desc: "Logos, favicon, rodapé e redes." },
  { href: "/admin/site/home", titulo: "Home", desc: "Hero, blocos e SEO da página inicial." },
  { href: "/admin/site/instituto", titulo: "Instituto", desc: "Texto, frentes e seções institucionais." },
  { href: "/admin/site/camila", titulo: "Camila", desc: "Biografia, formação e chamadas." },
  { href: "/admin/site/contato", titulo: "Contato", desc: "Canais de contato e acesso." },
  { href: "/admin/site/faq", titulo: "FAQ", desc: "SEO da página de perguntas frequentes." },
];

export default function SiteAdmin() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl text-ink">Site</h1>
      <p className="mt-1 text-sm text-ink-2">Edite o conteúdo das páginas institucionais e da marca.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {SECOES.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-[10px] border border-line bg-surface p-5 transition hover:bg-tan-bg"
          >
            <h2 className="font-semibold text-ink">{s.titulo}</h2>
            <p className="mt-1 text-sm text-ink-2">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

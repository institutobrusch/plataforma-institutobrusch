"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const MENU = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/site", label: "Site" },
  { href: "/admin/pensamento", label: "Pensamento diário" },
  { href: "/admin/moderacao", label: "Moderação" },
  { href: "/admin/cartografia", label: "Cartografia" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/eventos", label: "Eventos" },
  { href: "/admin/ebooks", label: "E-books" },
  { href: "/admin/cursos", label: "Cursos" },
  { href: "/admin/depoimentos", label: "Depoimentos" },
  { href: "/admin/acessos", label: "Acessos" },
  { href: "/admin/convites", label: "Convites" },
  { href: "/admin/auditoria", label: "Auditoria" },
];

export default function AdminShell({
  nome,
  children,
}: {
  nome: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="flex w-60 flex-col border-r border-line bg-surface">
        <div className="border-b border-line px-5 py-4">
          <Link href="/admin">
            <Image src="/brand/logo-navy.png" alt="Instituto Brusch" width={140} height={40} className="logo-light h-8 w-auto" />
            <Image src="/brand/logo-gold.png" alt="Instituto Brusch" width={140} height={40} className="logo-dark h-8 w-auto" />
          </Link>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-tan">Administração</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {MENU.map((item) => {
            const ativo = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  ativo ? "bg-navy text-surface" : "text-ink-2 hover:bg-tan-bg"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line p-3 text-sm">
          <p className="px-3 text-ink-2">{nome}</p>
          <Link href="/app" className="mt-1 block rounded-lg px-3 py-2 text-ink-2 hover:bg-tan-bg">Ver a plataforma</Link>
          <form action="/auth/signout" method="post">
            <button type="submit" className="w-full rounded-lg px-3 py-2 text-left text-ink-2 hover:bg-tan-bg">Sair</button>
          </form>
        </div>
      </aside>
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}

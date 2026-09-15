"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

const MENU = [
  { href: "/app", label: "Pensamento diário" },
  { href: "/app/comunidade", label: "Comunidade" },
];

// Mapa slug de produto → item de menu na plataforma.
const PRODUTO_MENU: Record<string, { href: string; label: string }> = {
  cartografia: { href: "/app/cartografia", label: "Cartografia" },
};

export default function AppShell({
  nome,
  email,
  produtos,
  isAdmin = false,
  children,
}: {
  nome: string;
  email: string;
  produtos: string[];
  isAdmin?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  useEffect(() => setAberto(false), [pathname]);

  const ativo = (href: string) =>
    href === "/app" ? pathname === "/app" : pathname.startsWith(href);

  const iniciais = (nome || email || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const itensProduto = produtos
    .map((slug) => PRODUTO_MENU[slug])
    .filter(Boolean) as { href: string; label: string }[];

  const NavItem = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
        ativo(href)
          ? "bg-white/10 text-white"
          : "text-[color:#C7CDD8] hover:bg-white/5 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );

  const Sidebar = (
    <div className="flex h-full flex-col bg-[color:var(--navy-d)] p-4 text-white">
      <Link href="/app" className="mb-6 flex">
        <Image src="/brand/logo-gold.png" alt="Instituto Brusch" width={150} height={42} className="h-8 w-auto" />
      </Link>

      <div className="mb-6 flex items-center gap-3 rounded-xl bg-white/5 p-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-tan text-sm font-bold text-[color:var(--navy-d)]">
          {iniciais}
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-sm font-semibold text-white">{nome || "Membro"}</span>
          <span className="block truncate text-xs text-[color:#AEB6C4]">{email}</span>
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {MENU.map((m) => (
          <NavItem key={m.href} {...m} />
        ))}
      </nav>

      {itensProduto.length > 0 && (
        <div className="mt-6">
          <span className="px-3 text-xs font-semibold uppercase tracking-widest text-[color:#8E97A8]">
            Meus produtos
          </span>
          <nav className="mt-2 flex flex-col gap-1">
            {itensProduto.map((p) => (
              <NavItem key={p.href} {...p} />
            ))}
          </nav>
        </div>
      )}

      {isAdmin && (
        <Link
          href="/admin"
          className="mt-6 flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-tan transition hover:bg-white/5"
        >
          ⚙ Administração
        </Link>
      )}

      <form action="/auth/signout" method="post" className="mt-auto">
        <button
          type="submit"
          className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[color:#C7CDD8] transition hover:bg-white/5 hover:text-white"
        >
          ↩ Sair da plataforma
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg md:grid md:grid-cols-[256px_1fr]">
      <aside className="sticky top-0 hidden h-screen md:block">{Sidebar}</aside>

      <div className="flex items-center justify-between border-b border-line bg-[color:var(--navy-d)] px-4 py-3 md:hidden">
        <Image src="/brand/logo-gold.png" alt="Instituto Brusch" width={130} height={36} className="h-7 w-auto" />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setAberto((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-lg text-xl text-white hover:bg-white/10"
          >
            <span aria-hidden>{aberto ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {aberto && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setAberto(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute left-0 top-0 h-full w-72" onClick={(e) => e.stopPropagation()}>
            {Sidebar}
          </div>
        </div>
      )}

      <main className="min-w-0 px-5 py-8 md:px-10 md:py-10">
        <div className="mx-auto max-w-[880px]">{children}</div>
      </main>
    </div>
  );
}

"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isDemoLogged, demoLogout } from "@/lib/demoAuth";
import ThemeToggle from "./ThemeToggle";

const MENU = [
  { href: "/app", label: "Pensamento diário" },
  { href: "/app/comunidade", label: "Comunidade" },
];

// Produtos que o usuário "comprou" (na demo, só a Cartografia).
const PRODUTOS = [{ href: "/app/cartografia", label: "Cartografia" }];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pronto, setPronto] = useState(false);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (!isDemoLogged()) router.replace("/entrar");
    else setPronto(true);
  }, [router]);

  useEffect(() => setAberto(false), [pathname]);

  function sair() {
    demoLogout();
    router.push("/");
  }

  const ativo = (href: string) =>
    href === "/app" ? pathname === "/app" : pathname.startsWith(href);

  if (!pronto) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg text-ink-3">
        Carregando…
      </div>
    );
  }

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
        <span className="grid h-10 w-10 place-items-center rounded-full bg-tan text-sm font-bold text-[color:var(--navy-d)]">
          CD
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-semibold text-white">Cliente demo</span>
          <span className="block text-xs text-[color:#AEB6C4]">membro@brusch.com</span>
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {MENU.map((m) => (
          <NavItem key={m.href} {...m} />
        ))}
      </nav>

      <div className="mt-6">
        <span className="px-3 text-xs font-semibold uppercase tracking-widest text-[color:#8E97A8]">
          Meus produtos
        </span>
        <nav className="mt-2 flex flex-col gap-1">
          {PRODUTOS.map((p) => (
            <NavItem key={p.href} {...p} />
          ))}
        </nav>
      </div>

      <button
        type="button"
        onClick={sair}
        className="mt-auto rounded-lg px-3 py-2 text-left text-sm font-medium text-[color:#C7CDD8] transition hover:bg-white/5 hover:text-white"
      >
        ↩ Sair da plataforma
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg md:grid md:grid-cols-[256px_1fr]">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen md:block">{Sidebar}</aside>

      {/* Top bar mobile */}
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

      {/* Drawer mobile */}
      {aberto && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setAberto(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute left-0 top-0 h-full w-72" onClick={(e) => e.stopPropagation()}>
            {Sidebar}
          </div>
        </div>
      )}

      {/* Conteúdo */}
      <main className="min-w-0 px-5 py-8 md:px-10 md:py-10">
        <div className="mx-auto max-w-[880px]">{children}</div>
      </main>
    </div>
  );
}

"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import Button from "./Button";
import type { MarcaContent } from "@/lib/site/types";

const NAV_ANTES = [
  { href: "/", label: "Início" },
  { href: "/instituto", label: "O Instituto" },
  { href: "/camila", label: "Camila Brusch" },
  { href: "/eventos", label: "Eventos" },
];

const PRODUTOS = [
  { href: "/cartografia", label: "Cartografia" },
  { href: "/cursos", label: "Cursos" },
  { href: "/ebooks", label: "E-books" },
];

const NAV_DEPOIS = [
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
];

export default function Header({
  marca,
  logoGoldUrl,
  logoNavyUrl,
}: {
  marca: MarcaContent;
  logoGoldUrl: string;
  logoNavyUrl: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prodOpen, setProdOpen] = useState(false);
  const prodRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const prodActive = PRODUTOS.some((p) => pathname.startsWith(p.href));

  // Fecha os menus ao trocar de página
  useEffect(() => {
    setOpen(false);
    setProdOpen(false);
  }, [pathname]);

  // Fecha o dropdown ao clicar fora (desktop)
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (prodRef.current && !prodRef.current.contains(e.target as Node)) {
        setProdOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const linkCls = (active: boolean) =>
    `whitespace-nowrap rounded-lg px-2.5 py-2 text-sm transition hover:text-ink ${
      active ? "font-semibold text-navy" : "font-medium text-ink-2"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-[1160px] items-center gap-4 px-6">
        <Link href="/" className="flex items-center" aria-label="Instituto Brusch — início">
          <Image src={logoNavyUrl} alt="Instituto Brusch" width={150} height={42} className="logo-light h-[38px] w-auto" priority />
          <Image src={logoGoldUrl} alt="Instituto Brusch" width={150} height={42} className="logo-dark h-[38px] w-auto" priority />
        </Link>

        <nav
          className={`${
            open ? "flex" : "hidden"
          } absolute inset-x-0 top-[68px] flex-col gap-1 border-b border-line bg-bg p-4 md:static md:ml-auto md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0`}
        >
          {NAV_ANTES.map((item) => (
            <Link key={item.href} href={item.href} className={linkCls(isActive(item.href))}>
              {item.label}
            </Link>
          ))}

          {/* Produtos — dropdown */}
          <div ref={prodRef} className="relative">
            <button
              type="button"
              onClick={() => setProdOpen((v) => !v)}
              aria-expanded={prodOpen}
              aria-haspopup="menu"
              className={`${linkCls(prodActive)} flex w-full items-center justify-between gap-1 md:w-auto md:justify-start`}
            >
              Produtos
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                className={`transition ${prodOpen ? "rotate-180" : ""}`} aria-hidden
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {prodOpen && (
              <div
                role="menu"
                className="mt-1 flex flex-col gap-0.5 rounded-lg border border-line bg-surface p-1 md:absolute md:left-0 md:top-full md:z-50 md:mt-2 md:w-52 md:shadow-lg"
              >
                {PRODUTOS.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    role="menuitem"
                    onClick={() => {
                      setProdOpen(false);
                      setOpen(false);
                    }}
                    className={`rounded-md px-3 py-2 text-sm transition hover:bg-tan-bg ${
                      isActive(p.href) ? "font-semibold text-navy" : "text-ink-2"
                    }`}
                  >
                    {p.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {NAV_DEPOIS.map((item) => (
            <Link key={item.href} href={item.href} className={linkCls(isActive(item.href))}>
              {item.label}
            </Link>
          ))}

          <div className="mt-2 md:mt-0 md:ml-2">
            <Button href="/entrar" className="w-full md:w-auto">
              Acessar a plataforma
            </Button>
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-1 md:ml-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Abrir menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-lg text-xl text-ink hover:bg-tan-bg md:hidden"
          >
            <span aria-hidden>{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

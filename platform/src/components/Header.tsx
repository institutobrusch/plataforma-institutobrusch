"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import Button from "./Button";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/instituto", label: "O Instituto" },
  { href: "/camila", label: "Camila Brusch" },
  { href: "/eventos", label: "Eventos" },
  { href: "/cartografia", label: "Cartografia" },
  { href: "/cursos", label: "Cursos" },
  { href: "/ebooks", label: "E-books" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-[1160px] items-center gap-4 px-6">
        <Link href="/" className="flex items-center" aria-label="Instituto Brusch — início">
          <Image
            src="/brand/logo-navy.png"
            alt="Instituto Brusch"
            width={150}
            height={42}
            className="logo-light h-[38px] w-auto"
            priority
          />
          <Image
            src="/brand/logo-gold.png"
            alt="Instituto Brusch"
            width={150}
            height={42}
            className="logo-dark h-[38px] w-auto"
            priority
          />
        </Link>

        <nav
          className={`${
            open ? "flex" : "hidden"
          } absolute inset-x-0 top-[68px] flex-col gap-1 border-b border-line bg-bg p-4 md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 md:ml-auto`}
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`whitespace-nowrap rounded-lg px-2.5 py-2 text-sm transition hover:text-ink ${
                isActive(item.href)
                  ? "font-semibold text-navy"
                  : "font-medium text-ink-2"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 md:mt-0 md:ml-2">
            <Button href="/contato" className="w-full md:w-auto">
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

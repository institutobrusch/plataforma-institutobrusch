"use client";
import { useEffect, useState } from "react";

type Mode = "system" | "light" | "dark";

function apply(m: Mode) {
  const d = document.documentElement;
  if (m === "light" || m === "dark") d.setAttribute("data-theme", m);
  else d.removeAttribute("data-theme");
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");

  useEffect(() => {
    try {
      const t = localStorage.getItem("theme") as Mode | null;
      if (t === "light" || t === "dark") setMode(t);
    } catch {}
  }, []);

  function cycle() {
    const next: Mode =
      mode === "system" ? "light" : mode === "light" ? "dark" : "system";
    setMode(next);
    try {
      if (next === "system") localStorage.removeItem("theme");
      else localStorage.setItem("theme", next);
    } catch {}
    apply(next);
  }

  const label =
    mode === "system"
      ? "Tema: automático"
      : mode === "light"
        ? "Tema: claro"
        : "Tema: escuro";
  const icon = mode === "light" ? "☀" : mode === "dark" ? "☾" : "◐";

  return (
    <button
      onClick={cycle}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-lg text-lg text-ink transition hover:bg-tan-bg"
    >
      <span aria-hidden>{icon}</span>
    </button>
  );
}

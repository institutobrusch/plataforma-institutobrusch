"use client";
import { useSyncExternalStore } from "react";

type Mode = "system" | "light" | "dark";

function apply(m: Mode) {
  const d = document.documentElement;
  if (m === "light" || m === "dark") d.setAttribute("data-theme", m);
  else d.removeAttribute("data-theme");
}

// Lê a preferência de tema do localStorage como um "external store", evitando
// setState dentro de useEffect e mantendo a hidratação consistente (o servidor
// sempre renderiza "system").
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}
function getSnapshot(): Mode {
  try {
    const t = localStorage.getItem("theme");
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}
function getServerSnapshot(): Mode {
  return "system";
}

export default function ThemeToggle() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function cycle() {
    const next: Mode =
      mode === "system" ? "light" : mode === "light" ? "dark" : "system";
    try {
      if (next === "system") localStorage.removeItem("theme");
      else localStorage.setItem("theme", next);
    } catch {}
    apply(next);
    emit();
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

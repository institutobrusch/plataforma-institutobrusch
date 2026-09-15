"use client";
import { useState } from "react";

// Player simulado (visual). O áudio real virá do Storage do Supabase (Etapa 3).
export default function AudioPlayerDemo({ duracao }: { duracao: string }) {
  const [tocando, setTocando] = useState(false);
  return (
    <div className="flex items-center gap-3 rounded-full border border-line bg-bg px-3 py-2">
      <button
        type="button"
        onClick={() => setTocando((v) => !v)}
        aria-label={tocando ? "Pausar" : "Reproduzir"}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy text-surface"
      >
        <span aria-hidden>{tocando ? "❚❚" : "▶"}</span>
      </button>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
        <div className={`h-full rounded-full bg-tan ${tocando ? "w-1/3" : "w-0"} transition-all`} />
      </div>
      <span className="shrink-0 text-xs tabular-nums text-ink-3">{duracao}</span>
    </div>
  );
}

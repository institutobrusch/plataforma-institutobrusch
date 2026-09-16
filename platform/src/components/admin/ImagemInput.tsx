"use client";
import { useRef, useState } from "react";
import { comprimirImagem } from "@/lib/imagem";

// Input de imagem que comprime/redimensiona no navegador antes do envio, para
// não estourar o limite de 4MB do corpo da Server Action (que gera um 413 na
// borda da Vercel e a tela "This page couldn't load"). Mostra preview e avisa
// quando a imagem ainda ficou grande demais.
export default function ImagemInput({
  name,
  label,
  currentUrl,
  accept = "image/*",
}: {
  name: string;
  label: string;
  currentUrl?: string;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  async function aoSelecionar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAviso(null);
    try {
      const comprimida = await comprimirImagem(file, 1600, 0.82);
      if (comprimida !== file && inputRef.current) {
        const dt = new DataTransfer();
        dt.items.add(comprimida);
        inputRef.current.files = dt.files;
      }
      if (comprimida.type.startsWith("image/") && comprimida.size > 4_000_000) {
        setAviso("Imagem ainda grande (>4MB). Use uma foto menor para conseguir salvar.");
      }
      setPreview(comprimida.type.startsWith("image/") ? URL.createObjectURL(comprimida) : null);
    } catch {
      setPreview(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
    }
  }

  return (
    <label className="text-sm text-ink-2">
      {label}
      {(preview || currentUrl) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview ?? currentUrl} alt="" className="mt-2 h-24 w-auto rounded-lg border border-line object-cover" />
      )}
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        onChange={aoSelecionar}
        className="mt-1 block w-full text-sm text-ink"
      />
      {aviso && <span className="mt-1 block text-xs text-red-600">{aviso}</span>}
    </label>
  );
}

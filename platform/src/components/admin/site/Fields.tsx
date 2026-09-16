"use client";
import { useRef, useState } from "react";

const INPUT = "w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink";
const LABEL = "block text-sm text-ink-2";
const BTN = "rounded-full bg-navy px-3 py-1 text-xs font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60";
const BTN_GHOST = "rounded-full border border-line px-3 py-1 text-xs font-medium text-ink-2 transition hover:bg-tan-bg disabled:opacity-40";

export function TextField({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) {
  return (
    <label className={LABEL}>
      {label}
      <input type="text" name={name} defaultValue={defaultValue ?? ""} className={`mt-1 ${INPUT}`} />
    </label>
  );
}

export function TextareaField({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) {
  return (
    <label className={LABEL}>
      {label}
      <textarea name={name} defaultValue={defaultValue ?? ""} rows={4} className={`mt-1 ${INPUT}`} />
    </label>
  );
}

export function ImageField({ name, label, currentUrl }: { name: string; label: string; currentUrl?: string }) {
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
        // Substitui o arquivo do input pelo comprimido, mantendo o mesmo name.
        const dt = new DataTransfer();
        dt.items.add(comprimida);
        inputRef.current.files = dt.files;
      }
      const usada = comprimida;
      if (usada.size > 4_000_000) {
        setAviso("Imagem ainda grande (>4MB). Use uma foto menor para conseguir salvar.");
      }
      setPreview(URL.createObjectURL(usada));
    } catch {
      // Se a compressão falhar, mantém o arquivo original selecionado.
      setPreview(URL.createObjectURL(file));
    }
  }

  return (
    <label className={LABEL}>
      {label}
      {(preview || currentUrl) && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview ?? currentUrl} alt="" className="mt-2 h-24 w-auto rounded-lg border border-line object-cover" />
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*"
        onChange={aoSelecionar}
        className="mt-2 block w-full text-sm text-ink"
      />
      {aviso && <span className="mt-1 block text-xs text-red-600">{aviso}</span>}
    </label>
  );
}

// Redimensiona e recomprime uma imagem no navegador antes do upload, para caber
// no limite de corpo da Server Action e deixar o site mais leve. Retorna o
// próprio arquivo quando não dá para/não vale a pena processar (SVG, GIF, etc.).
async function comprimirImagem(file: File, maxDim: number, qualidade: number): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;
  if (typeof document === "undefined" || typeof createImageBitmap === "undefined") return file;

  const bitmap = await createImageBitmap(file);
  const escala = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * escala);
  const h = Math.round(bitmap.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) { bitmap.close(); return file; }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  // PNG preserva transparência (logo); demais viram JPEG (fotos).
  const png = file.type === "image/png";
  const mime = png ? "image/png" : "image/jpeg";
  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, mime, png ? undefined : qualidade),
  );
  if (!blob || blob.size >= file.size) return file; // não piorar

  const ext = png ? "png" : "jpg";
  const base = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${base}.${ext}`, { type: mime });
}

export function StringListField({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string[] }) {
  const [items, setItems] = useState<string[]>(defaultValue ?? []);

  const atualizar = (i: number, v: string) => setItems((p) => p.map((x, idx) => (idx === i ? v : x)));
  const remover = (i: number) => setItems((p) => p.filter((_, idx) => idx !== i));
  const subir = (i: number) => setItems((p) => (i <= 0 ? p : swap(p, i, i - 1)));
  const descer = (i: number) => setItems((p) => (i >= p.length - 1 ? p : swap(p, i, i + 1)));
  const adicionar = () => setItems((p) => [...p, ""]);

  return (
    <div className="grid gap-2">
      <span className={LABEL}>{label}</span>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      {items.map((item, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <input type="text" value={item} onChange={(e) => atualizar(i, e.target.value)} className={`flex-1 ${INPUT}`} />
          <button type="button" onClick={() => subir(i)} disabled={i === 0} className={BTN_GHOST}>Subir</button>
          <button type="button" onClick={() => descer(i)} disabled={i === items.length - 1} className={BTN_GHOST}>Descer</button>
          <button type="button" onClick={() => remover(i)} className={BTN_GHOST}>Remover</button>
        </div>
      ))}
      <button type="button" onClick={adicionar} className={`justify-self-start ${BTN}`}>Adicionar</button>
    </div>
  );
}

type ListFieldSpec = { key: string; label: string; type?: "text" | "textarea" | "lines" };

export function ListField({
  name, label, fields, defaultValue,
}: { name: string; label: string; fields: ListFieldSpec[]; defaultValue?: Record<string, unknown>[] }) {
  const [items, setItems] = useState<Record<string, unknown>[]>(defaultValue ?? []);

  const atualizar = (i: number, key: string, v: unknown) =>
    setItems((p) => p.map((x, idx) => (idx === i ? { ...x, [key]: v } : x)));
  const remover = (i: number) => setItems((p) => p.filter((_, idx) => idx !== i));
  const subir = (i: number) => setItems((p) => (i <= 0 ? p : swap(p, i, i - 1)));
  const descer = (i: number) => setItems((p) => (i >= p.length - 1 ? p : swap(p, i, i + 1)));
  const adicionar = () =>
    setItems((p) => [
      ...p,
      Object.fromEntries(fields.map((f) => [f.key, f.type === "lines" ? [] : ""])),
    ]);

  return (
    <div className="grid gap-3">
      <span className={LABEL}>{label}</span>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      {items.map((item, i) => (
        <div key={i} className="grid gap-2 rounded-lg border border-line bg-bg p-3">
          {fields.map((f) => {
            if (f.type === "textarea") {
              return (
                <label key={f.key} className={LABEL}>
                  {f.label}
                  <textarea
                    value={asString(item[f.key])}
                    onChange={(e) => atualizar(i, f.key, e.target.value)}
                    rows={4}
                    className={`mt-1 ${INPUT}`}
                  />
                </label>
              );
            }
            if (f.type === "lines") {
              return (
                <label key={f.key} className={LABEL}>
                  {f.label}
                  <textarea
                    value={asLines(item[f.key]).join("\n")}
                    onChange={(e) =>
                      atualizar(i, f.key, e.target.value.split("\n").map((l) => l.trim()).filter((l) => l.length > 0))
                    }
                    rows={4}
                    className={`mt-1 ${INPUT}`}
                  />
                </label>
              );
            }
            return (
              <label key={f.key} className={LABEL}>
                {f.label}
                <input
                  type="text"
                  value={asString(item[f.key])}
                  onChange={(e) => atualizar(i, f.key, e.target.value)}
                  className={`mt-1 ${INPUT}`}
                />
              </label>
            );
          })}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => subir(i)} disabled={i === 0} className={BTN_GHOST}>Subir</button>
            <button type="button" onClick={() => descer(i)} disabled={i === items.length - 1} className={BTN_GHOST}>Descer</button>
            <button type="button" onClick={() => remover(i)} className={BTN_GHOST}>Remover</button>
          </div>
        </div>
      ))}
      <button type="button" onClick={adicionar} className={`justify-self-start ${BTN}`}>Adicionar</button>
    </div>
  );
}

function swap<T>(arr: T[], a: number, b: number): T[] {
  const copy = [...arr];
  [copy[a], copy[b]] = [copy[b], copy[a]];
  return copy;
}
function asString(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}
function asLines(v: unknown): string[] {
  return Array.isArray(v) ? v.map((x) => asString(x)) : [];
}

export function parseTopicos(texto: string): string[] {
  return texto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

export function montarNomeArquivo(originalName: string, prefixo?: string): string {
  const rawExt = originalName.includes(".") ? originalName.split(".").pop() ?? "" : "";
  const ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "bin";
  const base = crypto.randomUUID();
  const pref = prefixo ? `${prefixo.replace(/[^a-zA-Z0-9_-]/g, "")}/` : "";
  return `${pref}${base}.${ext}`;
}

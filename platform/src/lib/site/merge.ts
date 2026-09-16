type Obj = Record<string, unknown>;
export function mergeConteudo<T>(def: T, valor: unknown): T {
  if (valor == null || typeof valor !== "object" || Array.isArray(valor)) return def;
  const out: Obj = { ...(def as unknown as Obj) };
  for (const [k, v] of Object.entries(valor as Obj)) {
    if (v === undefined) continue;
    const d = (def as unknown as Obj)[k];
    if (v && typeof v === "object" && !Array.isArray(v) && d && typeof d === "object" && !Array.isArray(d)) {
      out[k] = mergeConteudo(d, v);
    } else {
      out[k] = v;
    }
  }
  return out as unknown as T;
}

// Redimensiona e recomprime uma imagem no navegador antes do upload, para caber
// no limite de corpo da Server Action (4MB) e deixar o site mais leve. Retorna o
// próprio arquivo quando não dá para/não vale a pena processar (SVG, GIF, áudio,
// PDF, etc.).
export async function comprimirImagem(file: File, maxDim = 1600, qualidade = 0.82): Promise<File> {
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

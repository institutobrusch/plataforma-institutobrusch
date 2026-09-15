export function pensamentoVisivel(
  p: { status: string; data: string },
  hojeISO: string,
): boolean {
  return p.status === "publicado" && p.data <= hojeISO;
}

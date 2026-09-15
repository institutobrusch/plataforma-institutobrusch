type ComStatus = { id: string; status: string };

export function montarFilaModeracao(input: {
  posts: ComStatus[];
  depoimentos: ComStatus[];
  sugestoes: ComStatus[];
}) {
  const pend = (arr: ComStatus[]) => arr.filter((x) => x.status === "pendente").length;
  const posts = pend(input.posts);
  const depoimentos = pend(input.depoimentos);
  const sugestoes = pend(input.sugestoes);
  return { posts, depoimentos, sugestoes, total: posts + depoimentos + sugestoes };
}

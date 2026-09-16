export type DepoimentoView = {
  tipo: string;
  nome: string;
  iniciais: string;
  contexto: string;
  texto: string | null;
  mediaUrl: string | null;
  youtubeId: string | null;
};

function Autor({ iniciais, nome, contexto }: { iniciais: string; nome: string; contexto: string }) {
  return (
    <figcaption className="mt-4 flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-navy text-sm font-semibold text-surface">{iniciais}</span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-ink">{nome}</span>
        <span className="block text-xs text-ink-3">{contexto}</span>
      </span>
    </figcaption>
  );
}

export default function TestimonialCard({ depoimento }: { depoimento: DepoimentoView }) {
  const { tipo, nome, iniciais, contexto, texto, mediaUrl, youtubeId } = depoimento;
  return (
    <figure className="mb-5 break-inside-avoid rounded-[10px] border border-line bg-surface p-6 shadow-sm">
      {tipo === "video" && youtubeId ? (
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={`Depoimento de ${nome}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : tipo === "imagem" && mediaUrl ? (
        <img src={mediaUrl} alt={`Depoimento de ${nome}`} className="w-full rounded-lg" />
      ) : tipo === "audio" && mediaUrl ? (
        <audio controls className="w-full" src={mediaUrl} />
      ) : (
        <>
          <span aria-hidden className="block text-3xl leading-none text-tan">&ldquo;</span>
          <blockquote className="mt-2 text-ink">{texto}</blockquote>
        </>
      )}
      {(texto && tipo !== "texto") && <p className="mt-3 text-sm text-ink-2">{texto}</p>}
      <Autor iniciais={iniciais} nome={nome} contexto={contexto} />
    </figure>
  );
}

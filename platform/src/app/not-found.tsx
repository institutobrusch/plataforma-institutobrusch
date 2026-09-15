import Button from "@/components/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-[640px] flex-col items-center justify-center px-6 py-24 text-center">
      <span className="text-sm font-bold uppercase tracking-[0.2em] text-tan">
        Erro 404
      </span>
      <h1 className="mt-3 text-4xl text-ink">Página não encontrada</h1>
      <p className="mt-3 text-ink-2">
        O conteúdo que você procura pode ter sido movido ou não existe mais.
      </p>
      <div className="mt-8">
        <Button href="/">Voltar para o início</Button>
      </div>
    </div>
  );
}

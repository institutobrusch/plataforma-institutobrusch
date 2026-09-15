"use client";
import { useState } from "react";
import Button from "./Button";

// Fluxo simulado de inscrição (a inscrição/pagamento reais entram na Etapa 4).
export default function InscricaoButton({
  titulo,
  preco,
}: {
  titulo: string;
  preco: number;
}) {
  const [aberto, setAberto] = useState(false);
  const [ok, setOk] = useState(false);
  const valor = preco > 0 ? `R$ ${preco}` : "Gratuito";

  return (
    <>
      <Button onClick={() => { setAberto(true); setOk(false); }}>
        Inscrever-se
      </Button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Inscrição"
          onClick={() => setAberto(false)}
        >
          <div
            className="w-full max-w-md rounded-[14px] bg-surface p-7 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {ok ? (
              <div className="text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-tan-bg text-2xl text-navy">
                  ✓
                </div>
                <h3 className="mt-4 text-xl font-semibold text-ink">
                  Inscrição confirmada!
                </h3>
                <p className="mt-2 text-sm text-ink-2">
                  (Demonstração) Em breve a inscrição e o pagamento reais estarão
                  disponíveis pela plataforma.
                </p>
                <div className="mt-6">
                  <Button onClick={() => setAberto(false)}>Fechar</Button>
                </div>
              </div>
            ) : (
              <>
                <span className="eyebrow">Inscrição</span>
                <h3 className="mt-1 text-xl font-semibold text-ink">{titulo}</h3>
                <p className="mt-1 text-sm text-ink-3">
                  Valor: <span className="font-semibold text-navy">{valor}</span>
                </p>
                <form
                  className="mt-4 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setOk(true);
                  }}
                >
                  <input required placeholder="Seu nome" className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm" />
                  <input required type="email" placeholder="Seu e-mail" className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm" />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" onClick={() => setAberto(false)}>
                      Cancelar
                    </Button>
                    <button
                      type="submit"
                      className="inline-flex items-center rounded-full bg-navy px-6 py-3 text-sm font-semibold text-surface transition hover:bg-navy-d"
                    >
                      Confirmar
                    </button>
                  </div>
                </form>
                <p className="mt-3 text-center text-xs text-ink-3">
                  Demonstração — nada é cobrado.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

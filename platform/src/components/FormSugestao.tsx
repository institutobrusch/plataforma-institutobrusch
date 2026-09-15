"use client";
import { useState } from "react";

// Formulário de sugestões (público). Na Etapa 1 apenas valida e confirma;
// na Etapa 3/5 passa a gravar em `suggestions` no Supabase.
export default function FormSugestao() {
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (texto.trim().length < 5) {
      setErro("Escreva um pouco mais para enviarmos sua sugestão.");
      return;
    }
    setErro("");
    setEnviado(true);
    setTexto("");
  }

  if (enviado) {
    return (
      <div className="rounded-[10px] border border-line bg-surface p-6">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-tan-bg text-xl text-navy">
          ✓
        </div>
        <h3 className="mt-3 font-semibold text-ink">Recebemos sua sugestão!</h3>
        <p className="mt-1 text-sm text-ink-2">
          Obrigado por contribuir. (Demonstração — o envio real será ativado com a
          plataforma.)
        </p>
        <button
          type="button"
          onClick={() => setEnviado(false)}
          className="mt-4 text-sm font-semibold text-navy hover:underline"
        >
          Enviar outra
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[10px] border border-line bg-surface p-6">
      <label htmlFor="sugestao" className="text-sm font-semibold text-ink">
        Sua sugestão
      </label>
      <textarea
        id="sugestao"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={4}
        placeholder="Como podemos melhorar? O que você gostaria de ver no instituto?"
        className="mt-2 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink"
        aria-invalid={!!erro}
      />
      {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
      <button
        type="submit"
        className="mt-4 inline-flex items-center rounded-full bg-navy px-6 py-3 text-sm font-semibold text-surface transition hover:bg-navy-d"
      >
        Enviar sugestão
      </button>
    </form>
  );
}

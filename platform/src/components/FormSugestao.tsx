"use client";
import { useActionState } from "react";
import { enviarSugestao, type SugestaoState } from "@/app/(site)/contato/actions";

export default function FormSugestao() {
  const [state, formAction, pending] = useActionState<SugestaoState, FormData>(
    enviarSugestao,
    null,
  );

  if (state?.ok) {
    return (
      <div className="rounded-[10px] border border-line bg-surface p-6">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-tan-bg text-xl text-navy">✓</div>
        <h3 className="mt-3 font-semibold text-ink">Recebemos sua sugestão!</h3>
        <p className="mt-1 text-sm text-ink-2">Obrigado por contribuir com o Instituto.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-[10px] border border-line bg-surface p-6">
      <label htmlFor="sugestao" className="text-sm font-semibold text-ink">Sua sugestão</label>
      <textarea
        id="sugestao"
        name="texto"
        rows={4}
        placeholder="Como podemos melhorar? O que você gostaria de ver no instituto?"
        className="mt-2 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink"
      />
      {state?.erro && <p className="mt-2 text-sm text-red-600">{state.erro}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 inline-flex items-center rounded-full bg-navy px-6 py-3 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar sugestão"}
      </button>
    </form>
  );
}

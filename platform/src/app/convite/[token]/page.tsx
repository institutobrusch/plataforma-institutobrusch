"use client";
import { use } from "react";
import { useActionState } from "react";
import { resgatarConvite, type ResgateState } from "./actions";

export default function ResgatePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [state, action, pending] = useActionState<ResgateState, FormData>(resgatarConvite, null);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-3xl text-ink">Ativar seu acesso</h1>
      <p className="mt-2 text-ink-2">Defina sua senha para entrar na plataforma.</p>
      <form action={action} className="mt-6 grid gap-3">
        <input type="hidden" name="token" value={token} />
        <input name="senha" type="password" placeholder="Crie uma senha (mín. 8 caracteres)" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        {state?.erro && <p className="text-sm text-red-600">{state.erro}</p>}
        <button type="submit" disabled={pending} className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60">
          {pending ? "Ativando…" : "Ativar acesso"}
        </button>
      </form>
    </div>
  );
}

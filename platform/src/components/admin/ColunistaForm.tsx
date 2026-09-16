"use client";
import { useActionState } from "react";
import { promoverColunista, type ColunistaState } from "@/app/(admin)/admin/blog/colunistas/actions";

export default function ColunistaForm() {
  const [state, action, pending] = useActionState<ColunistaState, FormData>(promoverColunista, null);
  return (
    <form action={action} className="grid gap-3">
      <input
        name="email"
        type="email"
        placeholder="E-mail da pessoa (precisa ter conta)"
        className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink"
      />
      {state?.erro && <p className="text-sm text-red-600">{state.erro}</p>}
      {state?.ok && <p className="text-sm text-green-700">Promovido!</p>}
      <button
        type="submit"
        disabled={pending}
        className="justify-self-start rounded-full bg-navy px-5 py-2 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60"
      >
        {pending ? "Promovendo…" : "Promover a colunista"}
      </button>
    </form>
  );
}

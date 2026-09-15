"use client";
import { useActionState } from "react";
import { publicarPost, type PostState } from "@/app/app/comunidade/actions";

export default function PostBox() {
  const [state, formAction, pending] = useActionState<PostState, FormData>(
    publicarPost,
    null,
  );

  return (
    <form action={formAction} className="rounded-2xl border border-line bg-surface p-4">
      <textarea
        name="texto"
        rows={3}
        placeholder="Compartilhe algo com a comunidade…"
        className="w-full resize-none rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-ink-3">Sua publicação passará por moderação.</span>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60"
        >
          {pending ? "Enviando…" : "Publicar"}
        </button>
      </div>
      {state?.ok && (
        <p className="mt-2 rounded-lg bg-tan-bg px-3 py-2 text-sm text-navy">
          ✓ Enviado! Sua publicação aparecerá após aprovação da moderação.
        </p>
      )}
      {state?.erro && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.erro}</p>
      )}
    </form>
  );
}

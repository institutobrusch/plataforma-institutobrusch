"use client";
import { useActionState } from "react";
import { comentar, type ComentarioState } from "@/app/app/comunidade/actions";

export default function CommentBox({ postId }: { postId: string }) {
  const [state, formAction, pending] = useActionState<ComentarioState, FormData>(
    comentar,
    null,
  );

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-2">
      <input type="hidden" name="postId" value={postId} />
      <textarea
        name="texto"
        rows={2}
        placeholder="Escreva um comentário…"
        className="w-full resize-none rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink"
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-ink-3">Comentários passam por moderação.</span>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-navy px-4 py-1.5 text-xs font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60"
        >
          {pending ? "Enviando…" : "Comentar"}
        </button>
      </div>
      {state?.ok && (
        <p className="rounded-lg bg-tan-bg px-3 py-2 text-xs text-navy">
          ✓ Enviado! Seu comentário aparecerá após aprovação.
        </p>
      )}
      {state?.erro && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{state.erro}</p>
      )}
    </form>
  );
}

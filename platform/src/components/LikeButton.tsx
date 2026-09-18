"use client";
import { useActionState } from "react";
import { curtir, type LikeState } from "@/app/app/comunidade/actions";

export default function LikeButton({
  postId,
  likes,
  curtido,
}: {
  postId: string;
  likes: number;
  curtido: boolean;
}) {
  const [state, formAction, pending] = useActionState<LikeState, FormData>(curtir, null);

  return (
    <form action={formAction} className="inline-flex flex-col">
      <input type="hidden" name="postId" value={postId} />
      <button
        type="submit"
        disabled={pending}
        className={`inline-flex items-center gap-1.5 transition hover:text-navy disabled:opacity-60 ${
          curtido ? "font-semibold text-navy" : ""
        }`}
      >
        <span aria-hidden>{curtido ? "♥" : "♡"}</span> {likes}
      </button>
      {state?.erro && <span className="text-xs text-red-600">{state.erro}</span>}
    </form>
  );
}

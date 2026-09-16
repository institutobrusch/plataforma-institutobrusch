"use client";
import { useActionState } from "react";
import type { FaqContent } from "@/lib/site/types";
import { salvarFaqSeo } from "@/app/(admin)/admin/site/faq/actions";
import { TextField, TextareaField } from "./Fields";

const BTN = "rounded-full bg-navy px-4 py-2 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60";

export default function FaqSeoForm({ inicial }: { inicial: FaqContent }) {
  const [state, formAction, pending] = useActionState(salvarFaqSeo, null);
  return (
    <form action={formAction} className="grid gap-5">
      <TextField name="seoTitle" label="SEO — título" defaultValue={inicial.seoTitle} />
      <TextareaField name="seoDescription" label="SEO — descrição" defaultValue={inicial.seoDescription} />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={BTN}>
          {pending ? "Salvando…" : "Salvar SEO"}
        </button>
        {state?.ok && <span className="text-sm text-green-700">Salvo!</span>}
        {state?.erro && <span className="text-sm text-red-600">{state.erro}</span>}
      </div>
    </form>
  );
}

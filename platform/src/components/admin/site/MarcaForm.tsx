"use client";
import { useActionState } from "react";
import type { MarcaContent } from "@/lib/site/types";
import { salvarMarca } from "@/app/(admin)/admin/site/marca/actions";
import { TextField, TextareaField, ImageField } from "./Fields";

const BTN = "rounded-full bg-navy px-4 py-2 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60";

export default function MarcaForm({
  inicial, logoGoldUrl, logoNavyUrl, faviconUrl,
}: {
  inicial: MarcaContent;
  logoGoldUrl: string;
  logoNavyUrl: string;
  faviconUrl: string;
}) {
  const [state, formAction, pending] = useActionState(salvarMarca, null);

  return (
    <form action={formAction} className="mt-6 grid gap-5">
      <div className="grid gap-5 sm:grid-cols-3">
        <ImageField name="logoGoldPath" label="Logo (dourado)" currentUrl={logoGoldUrl} />
        <ImageField name="logoNavyPath" label="Logo (navy)" currentUrl={logoNavyUrl} />
        <ImageField name="faviconPath" label="Favicon" currentUrl={faviconUrl} />
      </div>
      <TextareaField name="rodapeTagline" label="Tagline do rodapé" defaultValue={inicial.rodapeTagline} />
      <TextField name="instagramUrl" label="URL do Instagram" defaultValue={inicial.instagramUrl} />
      <TextField name="instagramHandle" label="Handle do Instagram" defaultValue={inicial.instagramHandle} />
      <TextField name="cidadeUf" label="Cidade / UF" defaultValue={inicial.cidadeUf} />

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={BTN}>
          {pending ? "Salvando…" : "Salvar"}
        </button>
        {state?.ok && <span className="text-sm text-green-700">Salvo!</span>}
        {state?.erro && <span className="text-sm text-red-600">{state.erro}</span>}
      </div>
    </form>
  );
}

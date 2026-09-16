"use client";
import { useActionState } from "react";
import type { CamilaContent } from "@/lib/site/types";
import { salvarCamila } from "@/app/(admin)/admin/site/camila/actions";
import { TextField, TextareaField, ImageField, StringListField, ListField } from "./Fields";

const BTN = "rounded-full bg-navy px-4 py-2 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60";
const SUB = "text-sm font-semibold text-ink";

export default function CamilaForm({
  inicial, fotoUrl,
}: {
  inicial: CamilaContent;
  fotoUrl: string;
}) {
  const [state, formAction, pending] = useActionState(salvarCamila, null);

  return (
    <form action={formAction} className="mt-6 grid gap-8">
      <section className="grid gap-5">
        <h2 className={SUB}>Cabeçalho</h2>
        <ImageField name="fotoPath" label="Foto" currentUrl={fotoUrl} />
        <TextField name="eyebrow" label="Eyebrow" defaultValue={inicial.eyebrow} />
        <TextField name="nome" label="Nome" defaultValue={inicial.nome} />
        <TextareaField name="resumo" label="Resumo" defaultValue={inicial.resumo} />
      </section>

      <section className="grid gap-5">
        <h2 className={SUB}>Formação & atuação</h2>
        <StringListField name="formacao" label="Formação & atuação" defaultValue={inicial.formacao} />
      </section>

      <section className="grid gap-5">
        <h2 className={SUB}>Seções de texto</h2>
        <ListField
          name="secoes"
          label="Seções"
          fields={[
            { key: "titulo", label: "Título", type: "text" },
            { key: "paragrafos", label: "Parágrafos (um por linha)", type: "lines" },
          ]}
          defaultValue={inicial.secoes}
        />
      </section>

      <section className="grid gap-5">
        <h2 className={SUB}>Botões (CTAs)</h2>
        <ListField
          name="ctas"
          label="CTAs"
          fields={[
            { key: "label", label: "Texto", type: "text" },
            { key: "href", label: "Link", type: "text" },
            { key: "variant", label: "Estilo (solid/ghost)", type: "text" },
          ]}
          defaultValue={inicial.ctas}
        />
      </section>

      <section className="grid gap-5">
        <h2 className={SUB}>SEO</h2>
        <TextField name="seoTitle" label="SEO — título" defaultValue={inicial.seoTitle} />
        <TextareaField name="seoDescription" label="SEO — descrição" defaultValue={inicial.seoDescription} />
      </section>

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

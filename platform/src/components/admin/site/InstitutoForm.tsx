"use client";
import { useActionState } from "react";
import type { InstitutoContent } from "@/lib/site/types";
import { salvarInstituto } from "@/app/(admin)/admin/site/instituto/actions";
import { TextField, TextareaField, ImageField, ListField } from "./Fields";

const BTN = "rounded-full bg-navy px-4 py-2 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60";
const SUB = "text-sm font-semibold text-ink";

export default function InstitutoForm({
  inicial, fotoUrl,
}: {
  inicial: InstitutoContent;
  fotoUrl: string;
}) {
  const [state, formAction, pending] = useActionState(salvarInstituto, null);

  return (
    <form action={formAction} className="mt-6 grid gap-8">
      <section className="grid gap-5">
        <h2 className={SUB}>Cabeçalho</h2>
        <ImageField name="fotoPath" label="Foto lateral" currentUrl={fotoUrl} />
        <TextField name="eyebrow" label="Eyebrow" defaultValue={inicial.eyebrow} />
        <TextField name="titulo" label="Título" defaultValue={inicial.titulo} />
        <TextareaField name="subtitulo" label="Subtítulo" defaultValue={inicial.subtitulo} />
      </section>

      <section className="grid gap-5">
        <h2 className={SUB}>Frentes de atuação</h2>
        <TextField name="frentesTitulo" label="Título da seção de frentes" defaultValue={inicial.frentesTitulo} />
        <ListField
          name="frentes"
          label="Frentes"
          fields={[
            { key: "destaque", label: "Destaque", type: "text" },
            { key: "texto", label: "Texto", type: "text" },
          ]}
          defaultValue={inicial.frentes}
        />
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
        <h2 className={SUB}>Botão (CTA)</h2>
        <TextField name="ctaLabel" label="CTA — texto do botão" defaultValue={inicial.cta.label} />
        <TextField name="ctaHref" label="CTA — link" defaultValue={inicial.cta.href} />
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

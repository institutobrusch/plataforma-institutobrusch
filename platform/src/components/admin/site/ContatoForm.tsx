"use client";
import { useActionState } from "react";
import type { ContatoContent } from "@/lib/site/types";
import { salvarContato } from "@/app/(admin)/admin/site/contato/actions";
import { TextField, TextareaField, ListField } from "./Fields";

const BTN = "rounded-full bg-navy px-4 py-2 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60";
const SUB = "text-sm font-semibold text-ink";

export default function ContatoForm({ inicial }: { inicial: ContatoContent }) {
  const [state, formAction, pending] = useActionState(salvarContato, null);

  return (
    <form action={formAction} className="mt-6 grid gap-8">
      <section className="grid gap-5">
        <h2 className={SUB}>Cabeçalho</h2>
        <TextField name="eyebrow" label="Eyebrow" defaultValue={inicial.eyebrow} />
        <TextField name="titulo" label="Título" defaultValue={inicial.titulo} />
      </section>

      <section className="grid gap-5">
        <h2 className={SUB}>Canais</h2>
        <ListField
          name="canais"
          label="Canais de contato"
          fields={[
            { key: "label", label: "Rótulo (ex.: Instagram)", type: "text" },
            { key: "valor", label: "Valor exibido (ex.: @institutobrusch)", type: "text" },
            { key: "href", label: "Link (opcional)", type: "text" },
          ]}
          defaultValue={inicial.canais}
        />
      </section>

      <section className="grid gap-5">
        <h2 className={SUB}>Acesso</h2>
        <TextareaField name="textoAcesso" label="Texto de acesso" defaultValue={inicial.textoAcesso} />
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

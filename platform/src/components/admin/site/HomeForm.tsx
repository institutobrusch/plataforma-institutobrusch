"use client";
import { useActionState } from "react";
import type { HomeContent } from "@/lib/site/types";
import { salvarHome } from "@/app/(admin)/admin/site/home/actions";
import { TextField, TextareaField, ListField, ImageField } from "./Fields";

const BTN = "rounded-full bg-navy px-4 py-2 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60";
const SUB = "text-sm font-semibold text-ink";

export default function HomeForm({ inicial, sobreFotoUrl }: { inicial: HomeContent; sobreFotoUrl?: string }) {
  const [state, formAction, pending] = useActionState(salvarHome, null);

  return (
    <form action={formAction} className="mt-6 grid gap-8">
      <section className="grid gap-5">
        <h2 className={SUB}>Hero</h2>
        <TextField name="eyebrow" label="Eyebrow" defaultValue={inicial.eyebrow} />
        <TextField name="heroTitulo" label="Título (início)" defaultValue={inicial.heroTitulo} />
        <TextField name="heroTituloEnfase" label="Título (ênfase)" defaultValue={inicial.heroTituloEnfase} />
        <TextField name="heroTituloFim" label="Título (fim)" defaultValue={inicial.heroTituloFim} />
        <TextareaField name="heroSubtitulo" label="Subtítulo" defaultValue={inicial.heroSubtitulo} />
      </section>

      <section className="grid gap-5">
        <h2 className={SUB}>Botões (CTAs)</h2>
        <TextField name="ctaPrimarioLabel" label="CTA primário — texto" defaultValue={inicial.ctaPrimarioLabel} />
        <TextField name="ctaPrimarioHref" label="CTA primário — link" defaultValue={inicial.ctaPrimarioHref} />
        <TextField name="ctaSecundarioLabel" label="CTA secundário — texto" defaultValue={inicial.ctaSecundarioLabel} />
        <TextField name="ctaSecundarioHref" label="CTA secundário — link" defaultValue={inicial.ctaSecundarioHref} />
      </section>

      <section className="grid gap-5">
        <h2 className={SUB}>Blocos</h2>
        <ListField
          name="blocos"
          label="Blocos de destaque (4)"
          fields={[
            { key: "titulo", label: "Título", type: "text" },
            { key: "texto", label: "Texto", type: "textarea" },
          ]}
          defaultValue={inicial.blocos}
        />
      </section>

      <section className="grid gap-5">
        <h2 className={SUB}>Seção “Sobre”</h2>
        <ImageField name="sobreFotoPath" label="Foto" currentUrl={sobreFotoUrl} />
        <TextField name="sobreEyebrow" label="Eyebrow" defaultValue={inicial.sobreEyebrow} />
        <TextField name="sobreTitulo" label="Título" defaultValue={inicial.sobreTitulo} />
        <TextareaField name="sobreTexto" label="Texto" defaultValue={inicial.sobreTexto} />
        <TextField name="sobreCta1Label" label="Botão 1 — texto" defaultValue={inicial.sobreCta1Label} />
        <TextField name="sobreCta1Href" label="Botão 1 — link" defaultValue={inicial.sobreCta1Href} />
        <TextField name="sobreCta2Label" label="Botão 2 — texto" defaultValue={inicial.sobreCta2Label} />
        <TextField name="sobreCta2Href" label="Botão 2 — link" defaultValue={inicial.sobreCta2Href} />
      </section>

      <section className="grid gap-5">
        <h2 className={SUB}>Seção “Depoimentos” (cabeçalho)</h2>
        <TextField name="depoEyebrow" label="Eyebrow" defaultValue={inicial.depoEyebrow} />
        <TextField name="depoTitulo" label="Título" defaultValue={inicial.depoTitulo} />
      </section>

      <section className="grid gap-5">
        <h2 className={SUB}>Chamada final (Cartografia)</h2>
        <TextField name="ctaFinalEyebrow" label="Eyebrow" defaultValue={inicial.ctaFinalEyebrow} />
        <TextField name="ctaFinalTitulo" label="Título" defaultValue={inicial.ctaFinalTitulo} />
        <TextareaField name="ctaFinalTexto" label="Texto" defaultValue={inicial.ctaFinalTexto} />
        <TextField name="ctaFinalLabel" label="Botão — texto" defaultValue={inicial.ctaFinalLabel} />
        <TextField name="ctaFinalHref" label="Botão — link" defaultValue={inicial.ctaFinalHref} />
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

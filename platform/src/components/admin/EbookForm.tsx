"use client";
import { useActionState } from "react";
import { salvarEbook, type EbookState } from "@/app/(admin)/admin/ebooks/actions";

type Ebook = { id: string; titulo: string; slug: string; descricao: string | null; preco: number | null; ativo: boolean | null };

export default function EbookForm({ ebook }: { ebook?: Ebook }) {
  const [state, action, pending] = useActionState<EbookState, FormData>(salvarEbook, null);
  return (
    <form action={action} className="grid gap-3">
      {ebook && <input type="hidden" name="id" value={ebook.id} />}
      <input name="titulo" defaultValue={ebook?.titulo ?? ""} placeholder="Título" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <input name="slug" defaultValue={ebook?.slug ?? ""} placeholder="slug (vazio = gerar do título)" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <textarea name="descricao" defaultValue={ebook?.descricao ?? ""} rows={3} placeholder="Descrição" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <input name="preco" type="number" step="0.01" defaultValue={ebook?.preco ?? 0} placeholder="Preço" className="w-32 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <label className="text-sm text-ink-2">Capa {ebook ? "(enviar substitui)" : ""}
        <input type="file" name="capa" accept="image/*" className="mt-1 block w-full text-sm text-ink" />
      </label>
      <label className="text-sm text-ink-2">Arquivo PDF {ebook ? "(enviar substitui)" : ""}
        <input type="file" name="arquivo" accept="application/pdf" className="mt-1 block w-full text-sm text-ink" />
      </label>
      <label className="flex items-center gap-2 text-sm text-ink-2">
        <input type="checkbox" name="ativo" defaultChecked={ebook ? !!ebook.ativo : true} /> Ativo
      </label>
      {state?.erro && <p className="text-sm text-red-600">{state.erro}</p>}
      {state?.ok && <p className="text-sm text-green-700">Salvo!</p>}
      <button type="submit" disabled={pending} className="justify-self-start rounded-full bg-navy px-5 py-2 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60">
        {pending ? "Salvando…" : ebook ? "Atualizar e-book" : "Criar e-book"}
      </button>
    </form>
  );
}

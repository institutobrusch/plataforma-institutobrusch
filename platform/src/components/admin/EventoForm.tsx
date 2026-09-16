"use client";
import { useActionState } from "react";
import { salvarEvento, type EventoState } from "@/app/(admin)/admin/eventos/actions";
import ImagemInput from "@/components/admin/ImagemInput";

type Evento = { id: string; titulo: string; slug: string; descricao: string | null; data: string | null; local: string | null; tipo: string | null; preco: number | null; vagas: string | null; ativo: boolean | null };

export default function EventoForm({ evento }: { evento?: Evento }) {
  const [state, action, pending] = useActionState<EventoState, FormData>(salvarEvento, null);
  return (
    <form action={action} className="grid gap-3">
      {evento && <input type="hidden" name="id" value={evento.id} />}
      <input name="titulo" defaultValue={evento?.titulo ?? ""} placeholder="Título" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <input name="slug" defaultValue={evento?.slug ?? ""} placeholder="slug (vazio = gerar do título)" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <textarea name="descricao" defaultValue={evento?.descricao ?? ""} rows={3} placeholder="Descrição" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <div className="flex flex-wrap gap-2">
        <input name="data" type="date" defaultValue={evento?.data ?? ""} className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        <select name="tipo" defaultValue={evento?.tipo ?? "Presencial"} className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink">
          <option value="Presencial">Presencial</option>
          <option value="Online">Online</option>
        </select>
        <input name="preco" type="number" step="0.01" defaultValue={evento?.preco ?? 0} placeholder="Preço" className="w-28 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      </div>
      <div className="flex flex-wrap gap-2">
        <input name="local" defaultValue={evento?.local ?? ""} placeholder="Local" className="flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        <input name="vagas" defaultValue={evento?.vagas ?? ""} placeholder="Vagas (ex.: 20)" className="w-32 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      </div>
      <ImagemInput name="poster" label={`Capa/poster ${evento ? "(enviar substitui a atual)" : ""}`} />
      <label className="flex items-center gap-2 text-sm text-ink-2">
        <input type="checkbox" name="ativo" defaultChecked={evento ? !!evento.ativo : true} /> Ativo
      </label>
      {state?.erro && <p className="text-sm text-red-600">{state.erro}</p>}
      {state?.ok && <p className="text-sm text-green-700">Salvo!</p>}
      <button type="submit" disabled={pending} className="justify-self-start rounded-full bg-navy px-5 py-2 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60">
        {pending ? "Salvando…" : evento ? "Atualizar evento" : "Criar evento"}
      </button>
    </form>
  );
}

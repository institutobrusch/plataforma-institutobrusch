"use client";
import { useActionState } from "react";
import { salvarDepoimento, type DepoimentoState } from "@/app/(admin)/admin/depoimentos/actions";
import ImagemInput from "@/components/admin/ImagemInput";

type Depo = { id: string; nome: string | null; iniciais: string | null; contexto: string | null; tipo: string; texto: string | null; video_url: string | null; ordem: number | null; status: string };

export default function DepoimentoForm({ depo }: { depo?: Depo }) {
  const [state, action, pending] = useActionState<DepoimentoState, FormData>(salvarDepoimento, null);
  return (
    <form action={action} className="grid gap-3">
      {depo && <input type="hidden" name="id" value={depo.id} />}
      <div className="flex flex-wrap gap-2">
        <input name="nome" defaultValue={depo?.nome ?? ""} placeholder="Nome" className="flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        <input name="iniciais" defaultValue={depo?.iniciais ?? ""} placeholder="Iniciais" className="w-24 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      </div>
      <input name="contexto" defaultValue={depo?.contexto ?? ""} placeholder="Contexto (ex.: participante d'O Círculo)" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <div className="flex flex-wrap gap-2">
        <select name="tipo" defaultValue={depo?.tipo ?? "texto"} className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink">
          <option value="texto">Texto</option>
          <option value="imagem">Imagem</option>
          <option value="audio">Áudio</option>
          <option value="video">Vídeo (YouTube)</option>
        </select>
        <select name="status" defaultValue={depo?.status ?? "aprovado"} className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink">
          <option value="aprovado">Aprovado</option>
          <option value="pendente">Pendente</option>
          <option value="recusado">Recusado</option>
        </select>
        <input name="ordem" type="number" defaultValue={depo?.ordem ?? 0} className="w-24 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      </div>
      <textarea name="texto" defaultValue={depo?.texto ?? ""} rows={3} placeholder="Texto do depoimento (ou legenda da mídia)" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <input name="video_url" defaultValue={depo?.video_url ?? ""} placeholder="URL do YouTube (para tipo vídeo)" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <ImagemInput name="midia" label={`Mídia (imagem ou áudio) ${depo ? "(enviar substitui)" : ""}`} accept="image/*,audio/*" />
      {state?.erro && <p className="text-sm text-red-600">{state.erro}</p>}
      {state?.ok && <p className="text-sm text-green-700">Salvo!</p>}
      <button type="submit" disabled={pending} className="justify-self-start rounded-full bg-navy px-5 py-2 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60">
        {pending ? "Salvando…" : depo ? "Atualizar depoimento" : "Criar depoimento"}
      </button>
    </form>
  );
}

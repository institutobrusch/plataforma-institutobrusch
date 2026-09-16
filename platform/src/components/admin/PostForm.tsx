"use client";
import { useActionState } from "react";
import { salvarPost, type PostState } from "@/app/(admin)/admin/blog/actions";

type PostInicial = {
  id?: string;
  titulo?: string;
  slug?: string;
  resumo?: string | null;
  data?: string | null;
  autor?: string | null;
  cargo?: string | null;
  corpo?: string[] | null;
  imagem_path?: string | null;
  publicado?: boolean | null;
};

export default function PostForm({
  inicial,
  autorPadrao,
  cargoPadrao,
  capaUrl,
}: {
  inicial?: PostInicial;
  autorPadrao?: string;
  cargoPadrao?: string;
  capaUrl?: string;
}) {
  const [state, action, pending] = useActionState<PostState, FormData>(salvarPost, null);
  return (
    <form action={action} className="grid gap-3">
      {inicial?.id && <input type="hidden" name="id" value={inicial.id} />}
      <label className="text-sm text-ink-2">Título
        <input name="titulo" defaultValue={inicial?.titulo ?? ""} placeholder="Título do post" className="mt-1 block w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      </label>
      <label className="text-sm text-ink-2">Slug
        <input name="slug" defaultValue={inicial?.slug ?? ""} placeholder="auto do título se vazio" className="mt-1 block w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      </label>
      <label className="text-sm text-ink-2">Resumo
        <textarea name="resumo" defaultValue={inicial?.resumo ?? ""} rows={2} placeholder="Resumo curto (aparece na listagem)" className="mt-1 block w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      </label>
      <div className="flex flex-wrap gap-2">
        <label className="flex-1 text-sm text-ink-2">Data
          <input name="data" defaultValue={inicial?.data ?? ""} placeholder="ex.: 21 ago 2026" className="mt-1 block w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        </label>
        <label className="flex-1 text-sm text-ink-2">Autor
          <input name="autor" defaultValue={inicial?.autor ?? autorPadrao ?? ""} placeholder="Autor" className="mt-1 block w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        </label>
        <label className="flex-1 text-sm text-ink-2">Cargo
          <input name="cargo" defaultValue={inicial?.cargo ?? cargoPadrao ?? ""} placeholder="Cargo" className="mt-1 block w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        </label>
      </div>
      <label className="text-sm text-ink-2">Corpo (um parágrafo por linha)
        <textarea name="corpo" defaultValue={(inicial?.corpo ?? []).join("\n")} rows={6} placeholder="Um parágrafo por linha" className="mt-1 block w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      </label>
      <label className="text-sm text-ink-2">Capa {inicial ? "(enviar substitui)" : ""}
        <input type="file" name="imagem" accept="image/*" className="mt-1 block w-full text-sm text-ink" />
      </label>
      {capaUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={capaUrl} alt="Capa atual" className="max-h-40 w-auto rounded-lg border border-line" />
      )}
      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" name="publicado" defaultChecked={inicial?.publicado ?? false} />
        Publicado
      </label>
      {state?.erro && <p className="text-sm text-red-600">{state.erro}</p>}
      {state?.ok && <p className="text-sm text-green-700">Salvo!</p>}
      <button type="submit" disabled={pending} className="justify-self-start rounded-full bg-navy px-5 py-2 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60">
        {pending ? "Salvando…" : inicial?.id ? "Atualizar post" : "Criar post"}
      </button>
    </form>
  );
}

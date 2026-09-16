"use client";
import { useActionState } from "react";
import { salvarProduto, type ProdutoState } from "@/app/(admin)/admin/produtos/actions";

type Produto = { id: string; nome: string; slug: string; tipo: string; preco: number; ativo: boolean };

export default function ProdutoForm({ produto }: { produto?: Produto }) {
  const [state, action, pending] = useActionState<ProdutoState, FormData>(salvarProduto, null);
  return (
    <form action={action} className="grid gap-3">
      {produto && <input type="hidden" name="id" value={produto.id} />}
      <input name="nome" defaultValue={produto?.nome ?? ""} placeholder="Nome" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      <input name="slug" defaultValue={produto?.slug ?? ""} placeholder="slug (deixe vazio para gerar do nome)" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      {produto && <p className="text-xs text-amber-700">Atenção: mudar o slug de um produto em uso pode quebrar acessos existentes.</p>}
      <div className="flex gap-2">
        <input name="tipo" defaultValue={produto?.tipo ?? ""} placeholder="tipo (ex.: cartografia, curso, ebook)" className="flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
        <input name="preco" type="number" step="0.01" defaultValue={produto?.preco ?? 0} placeholder="Preço" className="w-32 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" />
      </div>
      <label className="flex items-center gap-2 text-sm text-ink-2">
        <input type="checkbox" name="ativo" defaultChecked={produto ? produto.ativo : true} /> Ativo
      </label>
      {state?.erro && <p className="text-sm text-red-600">{state.erro}</p>}
      {state?.ok && <p className="text-sm text-green-700">Salvo!</p>}
      <button type="submit" disabled={pending} className="justify-self-start rounded-full bg-navy px-5 py-2 text-sm font-semibold text-surface transition hover:bg-navy-d disabled:opacity-60">
        {pending ? "Salvando…" : produto ? "Atualizar produto" : "Criar produto"}
      </button>
    </form>
  );
}

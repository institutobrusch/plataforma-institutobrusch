"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { demoLogin } from "@/lib/demoAuth";

export default function EntrarPage() {
  const router = useRouter();

  function entrar(e?: React.FormEvent) {
    e?.preventDefault();
    demoLogin();
    router.push("/app");
  }

  return (
    <div className="grid min-h-full md:grid-cols-2">
      {/* Painel visual */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-[color:var(--navy-d)] to-[color:var(--navy)] p-12 md:flex md:flex-col md:justify-between">
        <Link href="/" className="relative z-10 w-fit">
          <Image src="/brand/logo-gold.png" alt="Instituto Brusch" width={170} height={48} className="h-11 w-auto" />
        </Link>
        <Image
          src="/brand/logo-mark.png"
          alt=""
          aria-hidden
          width={520}
          height={520}
          className="pointer-events-none absolute -bottom-20 -right-16 w-[440px] max-w-none opacity-[0.09]"
        />
        <div className="relative z-10">
          <p className="font-serif text-3xl italic leading-snug text-white">
            &ldquo;Cuidar de vínculos é transformar histórias.&rdquo;
          </p>
          <p className="mt-3 text-sm text-[color:#C7CDD8]">
            Sua carta, seus áudios, seus materiais e a comunidade — tudo em um só
            lugar.
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex items-center justify-center bg-bg px-6 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex md:hidden">
            <Image src="/brand/logo-navy.png" alt="Instituto Brusch" width={150} height={42} className="logo-light h-9 w-auto" />
            <Image src="/brand/logo-gold.png" alt="Instituto Brusch" width={150} height={42} className="logo-dark h-9 w-auto" />
          </Link>

          <span className="text-xs font-bold uppercase tracking-[0.2em] text-tan">
            Área de membros
          </span>
          <h1 className="mt-2 text-3xl text-ink">Acessar a plataforma</h1>
          <p className="mt-2 text-sm text-ink-2">
            Entre para acessar seus produtos, o pensamento diário e a comunidade.
          </p>

          <button
            type="button"
            onClick={entrar}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 py-3 text-sm font-semibold text-ink transition hover:bg-surface-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.9 1.5l2.6-2.6C16.9 2.9 14.7 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c5.9 0 9.8-4.1 9.8-9.9 0-.7-.1-1.2-.2-1.7H12z" />
            </svg>
            Continuar com Google
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-ink-3">
            <span className="h-px flex-1 bg-line" /> ou <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={entrar} className="space-y-3">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-ink">E-mail</label>
              <input id="email" type="email" placeholder="voce@email.com" className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink" />
            </div>
            <div>
              <label htmlFor="senha" className="text-sm font-medium text-ink">Senha</label>
              <input id="senha" type="password" placeholder="••••••••" className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink" />
            </div>
            <button type="submit" className="w-full rounded-full bg-navy px-6 py-3 text-sm font-semibold text-surface transition hover:bg-navy-d">
              Entrar
            </button>
          </form>

          <button
            type="button"
            onClick={entrar}
            className="mt-3 w-full rounded-full border border-navy px-6 py-3 text-sm font-semibold text-navy transition hover:bg-tan-bg"
          >
            Entrar como cliente demo
          </button>

          <p className="mt-6 text-center text-xs text-ink-3">
            O cadastro é feito após a compra ou convite. Demonstração — nenhuma
            credencial é validada.
          </p>
          <p className="mt-4 text-center text-sm">
            <Link href="/" className="font-semibold text-navy hover:underline">
              ← Voltar ao site
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

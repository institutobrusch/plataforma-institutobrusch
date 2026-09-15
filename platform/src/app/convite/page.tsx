import Link from "next/link";
import Image from "next/image";

export const metadata = { title: "Convite" };

export default function ConvitePage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <Link href="/" className="mb-8">
        <Image src="/brand/logo-navy.png" alt="Instituto Brusch" width={160} height={45} className="logo-light h-10 w-auto" />
        <Image src="/brand/logo-gold.png" alt="Instituto Brusch" width={160} height={45} className="logo-dark h-10 w-auto" />
      </Link>
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-tan">Convite</span>
      <h1 className="mt-2 text-3xl text-ink">Resgatar convite</h1>
      <p className="mt-3 text-ink-2">
        O resgate de convites por link estará disponível em breve. Se você recebeu um
        acesso, use a página de login com o e-mail e a senha informados.
      </p>
      <Link
        href="/entrar"
        className="mt-8 inline-flex rounded-full bg-navy px-6 py-3 text-sm font-semibold text-surface transition hover:bg-navy-d"
      >
        Ir para o login
      </Link>
    </div>
  );
}

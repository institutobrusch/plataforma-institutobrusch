import Link from "next/link";

export default function StatCard({
  label,
  valor,
  href,
}: {
  label: string;
  valor: number | string;
  href?: string;
}) {
  const inner = (
    <div className="rounded-[10px] border border-line bg-surface p-5">
      <p className="text-3xl font-semibold text-ink tabular-nums">{valor}</p>
      <p className="mt-1 text-sm text-ink-2">{label}</p>
    </div>
  );
  return href ? <Link href={href} className="block transition hover:border-tan">{inner}</Link> : inner;
}

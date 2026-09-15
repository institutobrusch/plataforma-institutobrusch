import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-sm transition";
const styles: Record<Variant, string> = {
  primary: "bg-navy text-surface border border-navy hover:bg-navy-d hover:border-navy-d",
  ghost: "bg-transparent text-navy border border-navy hover:bg-tan-bg",
};

export default function Button({
  children,
  href,
  variant = "primary",
  onClick,
  className = "",
}: {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  onClick?: () => void;
  className?: string;
}) {
  const cls = `${base} ${styles[variant]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

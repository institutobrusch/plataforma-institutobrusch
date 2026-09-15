import type { ReactNode } from "react";

// Wrapper de largura da marca (max 1160px) com gutter lateral seguro.
export default function Section({
  children,
  className = "",
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "footer" | "header";
}) {
  return (
    <Tag className={`mx-auto w-full max-w-[1160px] px-6 ${className}`}>
      {children}
    </Tag>
  );
}

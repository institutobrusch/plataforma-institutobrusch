import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import ThemeScript from "@/components/ThemeScript";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Instituto Brusch",
    template: "%s · Instituto Brusch",
  },
  description:
    "Instituto Brusch — psicologia, terapia sistêmica e autoconhecimento em Palmas (TO). Psicoterapia, O Círculo e Cartografia.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full">
        <ThemeScript />
        {children}
      </body>
    </html>
  );
}

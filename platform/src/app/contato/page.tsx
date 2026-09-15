import type { Metadata } from "next";
import Eyebrow from "@/components/Eyebrow";
import FormSugestao from "@/components/FormSugestao";

export const metadata: Metadata = {
  title: "Contato & Sugestões",
  description:
    "Fale com o Instituto Brusch e envie suas sugestões. Palmas, Tocantins.",
};

export default function ContatoPage() {
  return (
    <div className="mx-auto max-w-[1160px] px-6 py-16">
      <Eyebrow>Contato</Eyebrow>
      <h1 className="mt-2 text-4xl text-ink">Fale com o Instituto</h1>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-ink">Canais</h2>
          <ul className="mt-3 space-y-2 text-ink-2">
            <li>
              Instagram:{" "}
              <a
                href="https://instagram.com/institutobrusch"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-navy hover:underline"
              >
                @institutobrusch
              </a>
            </li>
            <li>Palmas · Tocantins</li>
          </ul>
          <p className="mt-6 max-w-[46ch] text-sm text-ink-3">
            O acesso à plataforma (Cartografia, cursos e e-books) acontece após a
            compra ou convite. Em breve o login estará disponível aqui.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-ink">Enviar uma sugestão</h2>
          <FormSugestao />
        </div>
      </div>
    </div>
  );
}

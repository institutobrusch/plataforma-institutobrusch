import Image from "next/image";
import Link from "next/link";
import Section from "@/components/Section";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";
import EventCard from "@/components/EventCard";
import TestimonialCard, { type DepoimentoView } from "@/components/TestimonialCard";
import { getEventos } from "@/content";
import { createClient } from "@/lib/supabase/server";
import { youtubeId } from "@/lib/youtube";
import { getConteudo } from "@/lib/site/content";

export async function generateMetadata() {
  const home = await getConteudo("home");
  return { title: home.seoTitle, description: home.seoDescription };
}

export default async function Home() {
  const home = await getConteudo("home");
  const eventos = getEventos().slice(0, 3);
  const supabase = await createClient();
  const { data: depoRows } = await supabase
    .from("testimonials")
    .select("nome, iniciais, contexto, tipo, texto, media_path, video_url")
    .eq("status", "aprovado")
    .order("ordem", { ascending: true })
    .limit(3);
  const iniciaisDe = (n: string) => n.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const depoimentos: DepoimentoView[] = (depoRows ?? []).map((d) => {
    const nome = d.nome ?? "";
    return {
      tipo: d.tipo ?? "texto",
      nome,
      iniciais: d.iniciais || iniciaisDe(nome),
      contexto: d.contexto ?? "",
      texto: d.texto,
      mediaUrl: d.media_path ? supabase.storage.from("capas").getPublicUrl(d.media_path).data.publicUrl : null,
      youtubeId: youtubeId(d.video_url),
    };
  });

  return (
    <>
      {/* Hero full-bleed */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[color:var(--navy-d)] to-[color:var(--navy)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/logo-mark.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-10 w-[420px] max-w-none opacity-[0.07] md:opacity-10"
        />
        <div className="mx-auto flex min-h-[520px] max-w-[1160px] flex-col justify-center px-6 py-24">
          <div className="max-w-[620px]">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-tan">
              {home.eyebrow}
            </span>
            <h1 className="mt-4 text-4xl leading-tight text-white md:text-6xl">
              {home.heroTitulo}{" "}
              <span className="italic text-tan">{home.heroTituloEnfase}</span>{" "}
              {home.heroTituloFim}
            </h1>
            <p className="mt-6 max-w-[52ch] text-lg text-[color:#C7CDD8]">
              {home.heroSubtitulo}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={home.ctaPrimarioHref} className="border-white bg-white !text-navy hover:!bg-tan-bg hover:!text-navy">
                {home.ctaPrimarioLabel}
              </Button>
              <Button
                href={home.ctaSecundarioHref}
                variant="ghost"
                className="!border-white/70 !text-white hover:!bg-white/10"
              >
                {home.ctaSecundarioLabel}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Faixa de pilares */}
      <section className="bg-navy text-white">
        <div className="mx-auto grid max-w-[1160px] gap-8 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {home.blocos.map((p) => (
            <div key={p.titulo}>
              <h3 className="text-base font-semibold text-white">{p.titulo}</h3>
              <p className="mt-2 text-sm text-[color:#C7CDD8]">{p.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Próximos encontros */}
      <Section className="py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <Eyebrow>Agenda</Eyebrow>
            <h2 className="mt-2 text-3xl text-ink">Próximos encontros</h2>
          </div>
          <Link href="/eventos" className="hidden text-sm font-semibold text-navy hover:underline sm:block">
            Ver todos →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {eventos.map((e) => (
            <EventCard key={e.slug} evento={e} />
          ))}
        </div>
      </Section>

      {/* Sobre */}
      <section className="bg-surface-2">
        <div className="mx-auto grid max-w-[1160px] items-center gap-10 px-6 py-20 md:grid-cols-[0.85fr_1.15fr]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[10px] bg-tan-bg shadow-sm">
            <Image
              src="/fotos/camila-3.jpg"
              alt="Instituto Brusch — cuidado e presença"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover object-top"
            />
          </div>
          <div>
            <Eyebrow>Sobre</Eyebrow>
            <h2 className="mt-2 text-3xl text-ink">
              Um cuidado com profundidade e método
            </h2>
            <p className="mt-4 max-w-[54ch] text-lg text-ink-2">
              O Instituto Brusch une o rigor da psicologia clínica ao trabalho de
              autoconhecimento em grupo — para quem quer romper padrões e viver com
              mais presença.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/instituto">Conhecer o Instituto</Button>
              <Button href="/camila" variant="ghost">
                Sobre a Camila
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <Section className="py-20">
        <div className="mb-8">
          <Eyebrow>Histórias</Eyebrow>
          <h2 className="mt-2 text-3xl text-ink">O que dizem quem passou por aqui</h2>
        </div>
        <div className="[column-gap:1.25rem] sm:columns-2 lg:columns-3">
          {depoimentos.map((d, i) => (
            <TestimonialCard key={i} depoimento={d} />
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section className="py-20">
        <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[color:var(--navy-d)] to-[color:var(--navy)] px-6 py-16 text-center md:px-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-mark.svg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -right-10 w-[280px] max-w-none opacity-[0.08]"
          />
          <div className="relative">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-tan">
              Cartografia
            </span>
            <h2 className="mx-auto mt-3 max-w-[20ch] text-3xl text-white">
              A sua Cartografia começa com um encontro
            </h2>
            <p className="mx-auto mt-3 max-w-[52ch] text-[color:#C7CDD8]">
              Um acompanhamento contínuo a partir da sua carta — leituras mensais,
              áudios e materiais que caminham com você.
            </p>
            <div className="mt-7 flex justify-center">
              <Button
                href="/cartografia"
                className="border-white bg-white !text-navy hover:!bg-tan-bg"
              >
                Conhecer a Cartografia
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

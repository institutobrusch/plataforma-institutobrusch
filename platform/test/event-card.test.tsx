import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import EventCard from "@/components/EventCard";

describe("EventCard", () => {
  it("renderiza título, tipo e valor gratuito", () => {
    render(
      <EventCard
        evento={{
          slug: "x",
          titulo: "Evento Teste",
          tipo: "Online",
          data: "1 jan 2026",
          local: "Ao vivo",
          preco: 0,
          vagas: "Aberto",
          descricao: "desc",
        }}
      />,
    );
    expect(screen.getByText("Evento Teste")).toBeInTheDocument();
    expect(screen.getByText("Online")).toBeInTheDocument();
    expect(screen.getByText(/Gratuito/i)).toBeInTheDocument();
  });

  it("mostra preço em reais quando pago", () => {
    render(
      <EventCard
        evento={{
          slug: "y",
          titulo: "Pago",
          tipo: "Presencial",
          data: "2 fev",
          local: "Sede",
          preco: 180,
          vagas: "6 vagas",
          descricao: "desc",
        }}
      />,
    );
    expect(screen.getByText("R$ 180")).toBeInTheDocument();
  });
});

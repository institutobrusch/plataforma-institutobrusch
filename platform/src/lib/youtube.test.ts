import { describe, it, expect } from "vitest";
import { youtubeId } from "./youtube";

describe("youtubeId", () => {
  it("extrai de watch?v=", () => {
    expect(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("extrai de youtu.be", () => {
    expect(youtubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("extrai de embed", () => {
    expect(youtubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("aceita id puro", () => {
    expect(youtubeId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("retorna null para vazio/lixo", () => {
    expect(youtubeId("")).toBeNull();
    expect(youtubeId("https://exemplo.com/x")).toBeNull();
    expect(youtubeId(null)).toBeNull();
  });
});

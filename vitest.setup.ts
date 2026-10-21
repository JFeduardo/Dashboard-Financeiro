import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Limpa a tela simulada depois de cada teste
afterEach(() => {
  cleanup();
});

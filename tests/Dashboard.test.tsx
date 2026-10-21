import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dashboard } from "@/components/Dashboard";
import { FinanceProvider } from "@/context/FinanceContext";

// Teste de integração: monta o app inteiro (com dados de exemplo) e simula o uso.

function renderApp() {
  return render(
    <FinanceProvider>
      <Dashboard />
    </FinanceProvider>
  );
}

describe("Dashboard", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("mostra o saldo e as transações de exemplo", () => {
    renderApp();
    expect(screen.getByText("Saldo de todos os meses")).toBeInTheDocument();
    expect(screen.getAllByText(/1\.790,00/).length).toBeGreaterThan(0);
    expect(screen.getByText("Supermercado")).toBeInTheDocument();
  });

  it("adiciona uma transação, atualiza o saldo e salva no navegador", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText("Descrição"), "Café");
    await user.type(screen.getByLabelText("Valor (R$)"), "15");
    await user.selectOptions(screen.getByLabelText("Categoria"), "Alimentação");
    await user.click(screen.getByRole("button", { name: "Adicionar transação" }));

    expect(screen.getByText("Café")).toBeInTheDocument();
    expect(screen.getAllByText(/1\.775,00/).length).toBeGreaterThan(0);

    const saved = JSON.parse(localStorage.getItem("transactions") ?? "[]");
    expect(saved.some((t: { description: string }) => t.description === "Café")).toBe(true);
  });

  it("exclui uma transação", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "Excluir Ônibus" }));

    expect(screen.queryByText("Ônibus")).toBeNull();
    expect(screen.getAllByText(/1\.880,00/).length).toBeGreaterThan(0);
  });

  it("edita uma transação existente", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "Editar Internet" }));
    const description = screen.getByLabelText("Descrição");
    await user.clear(description);
    await user.type(description, "Internet fibra");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(screen.getByText("Internet fibra")).toBeInTheDocument();
    expect(screen.queryByText("Internet")).toBeNull();
    expect(screen.getByRole("button", { name: "Adicionar transação" })).toBeInTheDocument();
  });

  it("filtra a lista pela busca", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText("Buscar por descrição"), "alug");

    expect(screen.getByText("Aluguel")).toBeInTheDocument();
    expect(screen.queryByText("Supermercado")).toBeNull();
  });

  it("cria parcelas em meses seguintes", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText("Descrição"), "Celular");
    await user.type(screen.getByLabelText("Valor (R$)"), "200");
    await user.selectOptions(screen.getByLabelText("Categoria"), "Outros");
    const installments = screen.getByLabelText("Repetir por quantos meses");
    await user.clear(installments);
    await user.type(installments, "3");
    await user.click(screen.getByRole("button", { name: "Adicionar transação" }));

    expect(screen.getByText("Celular (1/3)")).toBeInTheDocument();
    expect(screen.getByText("Celular (2/3)")).toBeInTheDocument();
    expect(screen.getByText("Celular (3/3)")).toBeInTheDocument();
  });

  it("mostra o alerta quando o orçamento da categoria estoura", async () => {
    const user = userEvent.setup();
    renderApp();

    const limit = screen.getByLabelText("Limite mensal de Moradia");
    await user.type(limit, "500");

    const bar = screen.getByRole("progressbar", { name: "Uso do orçamento de Moradia" });
    expect(bar).toHaveAttribute("aria-valuenow", "100");
    const card = bar.closest("li") as HTMLElement;
    expect(within(card).getByText(/estourou em/)).toBeInTheDocument();
  });

  it("acompanha a meta de economia", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText("Quanto quero guardar por mês (R$)"), "3000");

    expect(screen.getByText(/Faltam/)).toBeInTheDocument();
  });
});

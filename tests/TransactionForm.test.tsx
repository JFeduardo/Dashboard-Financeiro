import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TransactionForm } from "@/components/TransactionForm";

describe("TransactionForm", () => {
  it("mostra mensagens de erro quando os campos estão vazios", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<TransactionForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Adicionar transação" }));

    expect(screen.getByText("Informe uma descrição")).toBeInTheDocument();
    expect(screen.getByText("Informe um valor válido")).toBeInTheDocument();
    expect(screen.getByText("Escolha uma categoria")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("envia os valores validados e limpa os campos", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<TransactionForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Descrição"), "Supermercado");
    await user.type(screen.getByLabelText("Valor (R$)"), "120.50");
    await user.selectOptions(screen.getByLabelText("Categoria"), "Alimentação");
    await user.click(screen.getByRole("button", { name: "Adicionar transação" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Supermercado",
        amount: 120.5,
        type: "expense",
        category: "Alimentação",
        installments: 1,
      })
    );
    expect(screen.getByLabelText("Descrição")).toHaveValue("");
  });

  it("troca as categorias ao mudar para receita", async () => {
    const user = userEvent.setup();
    render(<TransactionForm onSubmit={vi.fn()} />);

    expect(screen.queryByRole("option", { name: "Investimentos" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Receita" }));
    expect(screen.getByRole("option", { name: "Investimentos" })).toBeInTheDocument();
  });

  it("preenche os campos ao editar e mostra o botão de cancelar", () => {
    render(
      <TransactionForm
        editing={{
          id: 7,
          description: "Aluguel",
          amount: 800,
          type: "expense",
          category: "Moradia",
          date: "2026-10-06",
        }}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByLabelText("Descrição")).toHaveValue("Aluguel");
    expect(screen.getByLabelText("Valor (R$)")).toHaveValue(800);
    expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });
});

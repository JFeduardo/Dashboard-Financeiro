import { describe, expect, it } from "vitest";
import type { Transaction } from "@/types/transaction";
import type { FinanceState } from "@/types/finance";
import { financeReducer } from "@/lib/reducer";

const base: Transaction = {
  id: 1,
  description: "Aluguel",
  amount: 800,
  type: "expense",
  category: "Moradia",
  date: "2026-10-06",
};

const state: FinanceState = { transactions: [base], budgets: {}, goal: 0 };

describe("financeReducer", () => {
  it("adiciona novas transações no início sem alterar o estado antigo", () => {
    const novo: Transaction = { ...base, id: 2, description: "Café" };
    const next = financeReducer(state, { type: "add", transactions: [novo] });
    expect(next.transactions.map((t) => t.id)).toEqual([2, 1]);
    expect(state.transactions).toHaveLength(1);
  });

  it("atualiza uma transação pelo id", () => {
    const next = financeReducer(state, {
      type: "update",
      transaction: { ...base, amount: 900 },
    });
    expect(next.transactions[0].amount).toBe(900);
  });

  it("exclui uma transação pelo id", () => {
    const next = financeReducer(state, { type: "delete", id: 1 });
    expect(next.transactions).toEqual([]);
  });

  it("importa sem duplicar transações que já existem", () => {
    const repetida = { ...base, id: 99 };
    const nova: Transaction = { ...base, id: 100, description: "Internet" };
    const next = financeReducer(state, {
      type: "import",
      transactions: [repetida, nova],
    });
    expect(next.transactions.map((t) => t.description)).toEqual(["Internet", "Aluguel"]);
  });

  it("define e remove orçamentos", () => {
    const withBudget = financeReducer(state, {
      type: "setBudget",
      category: "Moradia",
      limit: 900,
    });
    expect(withBudget.budgets).toEqual({ Moradia: 900 });

    const removed = financeReducer(withBudget, {
      type: "setBudget",
      category: "Moradia",
      limit: null,
    });
    expect(removed.budgets).toEqual({});
  });

  it("define a meta e não aceita valor negativo", () => {
    expect(financeReducer(state, { type: "setGoal", goal: 500 }).goal).toBe(500);
    expect(financeReducer(state, { type: "setGoal", goal: -5 }).goal).toBe(0);
  });
});

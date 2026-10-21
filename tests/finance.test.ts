import { describe, expect, it } from "vitest";
import type { Transaction } from "@/types/transaction";
import {
  budgetStatus,
  compareMonths,
  expandInstallments,
  expensesByCategory,
  filterTransactions,
  getMonths,
  getTotals,
  groupByDate,
  monthlySeries,
  percentChange,
  referenceMonth,
} from "@/lib/finance";

const data: Transaction[] = [
  { id: 1, description: "Salário", amount: 2500, type: "income", category: "Trabalho", date: "2026-10-05" },
  { id: 2, description: "Aluguel", amount: 800, type: "expense", category: "Moradia", date: "2026-10-06" },
  { id: 3, description: "Supermercado", amount: 320, type: "expense", category: "Alimentação", date: "2026-10-08" },
  { id: 4, description: "Café", amount: 15, type: "expense", category: "Alimentação", date: "2026-10-08" },
  { id: 5, description: "Salário", amount: 2400, type: "income", category: "Trabalho", date: "2026-09-05" },
  { id: 6, description: "Aluguel", amount: 800, type: "expense", category: "Moradia", date: "2026-09-06" },
];

describe("getTotals", () => {
  it("soma receitas e despesas e calcula o saldo", () => {
    expect(getTotals(data)).toEqual({ income: 4900, expense: 1935, balance: 2965 });
  });

  it("devolve zeros para lista vazia", () => {
    expect(getTotals([])).toEqual({ income: 0, expense: 0, balance: 0 });
  });

  it("evita erros de arredondamento em centavos", () => {
    const cents: Transaction[] = [
      { id: 1, description: "A", amount: 0.1, type: "expense", category: "Outros", date: "2026-10-01" },
      { id: 2, description: "B", amount: 0.2, type: "expense", category: "Outros", date: "2026-10-01" },
    ];
    expect(getTotals(cents).expense).toBe(0.3);
  });
});

describe("getMonths", () => {
  it("lista os meses sem repetição, do mais recente ao mais antigo", () => {
    expect(getMonths(data)).toEqual(["2026-10", "2026-09"]);
  });
});

describe("filterTransactions", () => {
  it("filtra por mês", () => {
    const result = filterTransactions(data, { month: "2026-09", search: "", category: "all" });
    expect(result.map((t) => t.id)).toEqual([5, 6]);
  });

  it("busca ignorando acentos e maiúsculas", () => {
    const result = filterTransactions(data, { month: "all", search: "CAFE", category: "all" });
    expect(result.map((t) => t.description)).toEqual(["Café"]);
  });

  it("filtra por categoria", () => {
    const result = filterTransactions(data, { month: "all", search: "", category: "Moradia" });
    expect(result).toHaveLength(2);
  });

  it("combina os três filtros", () => {
    const result = filterTransactions(data, { month: "2026-10", search: "super", category: "Alimentação" });
    expect(result.map((t) => t.id)).toEqual([3]);
  });
});

describe("expensesByCategory", () => {
  it("agrupa despesas por categoria e ordena da maior para a menor", () => {
    expect(expensesByCategory(data)).toEqual([
      { name: "Moradia", value: 1600 },
      { name: "Alimentação", value: 335 },
    ]);
  });
});

describe("monthlySeries", () => {
  it("devolve receitas e despesas por mês em ordem cronológica", () => {
    expect(monthlySeries(data)).toEqual([
      { month: "2026-09", income: 2400, expense: 800 },
      { month: "2026-10", income: 2500, expense: 1135 },
    ]);
  });
});

describe("groupByDate", () => {
  it("agrupa por data, da mais recente para a mais antiga", () => {
    const groups = groupByDate(data);
    expect(groups.map(([date]) => date)).toEqual([
      "2026-10-08",
      "2026-10-06",
      "2026-10-05",
      "2026-09-06",
      "2026-09-05",
    ]);
    expect(groups[0][1]).toHaveLength(2);
  });
});

describe("compareMonths e percentChange", () => {
  it("compara o mês com o anterior", () => {
    const result = compareMonths(data, "2026-10");
    expect(result.previousMonth).toBe("2026-09");
    expect(result.current.expense).toBe(1135);
    expect(result.previous.expense).toBe(800);
  });

  it("calcula a variação percentual", () => {
    expect(percentChange(1135, 800)).toBe(42);
    expect(percentChange(400, 800)).toBe(-50);
  });

  it("devolve null quando não há mês anterior para comparar", () => {
    expect(percentChange(100, 0)).toBeNull();
  });

  it("cruza a virada de ano", () => {
    expect(compareMonths([], "2026-01").previousMonth).toBe("2025-12");
  });
});

describe("referenceMonth", () => {
  it("usa o mês escolhido", () => {
    expect(referenceMonth(data, "2026-09")).toBe("2026-09");
  });

  it('em "all", usa o mês mais recente dos dados', () => {
    expect(referenceMonth(data, "all")).toBe("2026-10");
  });

  it("devolve null quando não há dados", () => {
    expect(referenceMonth([], "all")).toBeNull();
  });
});

describe("budgetStatus", () => {
  it("fica ok abaixo de 80%", () => {
    expect(budgetStatus(79, 100).level).toBe("ok");
  });

  it("avisa a partir de 80%", () => {
    expect(budgetStatus(80, 100).level).toBe("warning");
    expect(budgetStatus(100, 100).level).toBe("warning");
  });

  it("marca como estourado acima de 100%", () => {
    const status = budgetStatus(150, 100);
    expect(status.level).toBe("over");
    expect(status.pct).toBe(150);
  });
});

describe("expandInstallments", () => {
  const base = {
    description: "Notebook",
    amount: 500,
    type: "expense" as const,
    category: "Outros",
    date: "2026-11-30",
  };

  it("não altera a descrição quando é uma transação só", () => {
    const [only] = expandInstallments(base, 1, 10);
    expect(only).toEqual({ ...base, id: 10 });
  });

  it("cria uma transação por mês com sufixo e ids diferentes", () => {
    const result = expandInstallments(base, 3, 100);
    expect(result.map((t) => t.description)).toEqual([
      "Notebook (1/3)",
      "Notebook (2/3)",
      "Notebook (3/3)",
    ]);
    expect(result.map((t) => t.id)).toEqual([100, 101, 102]);
  });

  it("ajusta o dia quando o mês seguinte é mais curto e cruza o ano", () => {
    const result = expandInstallments(base, 4, 1);
    expect(result.map((t) => t.date)).toEqual([
      "2026-11-30",
      "2026-12-30",
      "2027-01-30",
      "2027-02-28",
    ]);
  });
});

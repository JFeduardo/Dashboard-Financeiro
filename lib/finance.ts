import type { Transaction } from "@/types/transaction";
import { addMonths, previousMonth } from "@/lib/dates";

// Funções puras (sem React): recebem dados e devolvem dados.
// Por isso são fáceis de testar e de explicar.

export type Totals = { income: number; expense: number; balance: number };
export type Filters = { month: string; search: string; category: string };
export type CategoryTotal = { name: string; value: number };
export type MonthlyPoint = { month: string; income: number; expense: number };
export type BudgetLevel = "ok" | "warning" | "over";
export type MonthComparison = {
  month: string;
  previousMonth: string;
  current: Totals;
  previous: Totals;
};

// Evita resultados como 0.30000000000000004 nas somas
function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export function getTotals(transactions: Transaction[]): Totals {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    income: round2(income),
    expense: round2(expense),
    balance: round2(income - expense),
  };
}

// Meses que existem nos dados, do mais recente para o mais antigo
export function getMonths(transactions: Transaction[]): string[] {
  return Array.from(new Set(transactions.map((t) => t.date.slice(0, 7))))
    .sort()
    .reverse();
}

// Remove acentos e maiúsculas: "Café" e "cafe" ficam iguais na busca
export function normalizeText(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function filterTransactions(
  transactions: Transaction[],
  filters: Filters
): Transaction[] {
  const search = normalizeText(filters.search);

  return transactions.filter((t) => {
    const matchesMonth =
      filters.month === "all" || t.date.startsWith(filters.month);
    const matchesCategory =
      filters.category === "all" || t.category === filters.category;
    const matchesSearch =
      search === "" || normalizeText(t.description).includes(search);

    return matchesMonth && matchesCategory && matchesSearch;
  });
}

// Despesas somadas por categoria, da maior para a menor
export function expensesByCategory(
  transactions: Transaction[]
): CategoryTotal[] {
  const totals = transactions
    .filter((t) => t.type === "expense")
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount;
      return acc;
    }, {});

  return Object.entries(totals)
    .map(([name, value]) => ({ name, value: round2(value) }))
    .sort((a, b) => b.value - a.value);
}

// Receitas e despesas de cada mês, em ordem cronológica
export function monthlySeries(transactions: Transaction[]): MonthlyPoint[] {
  return getMonths(transactions)
    .reverse()
    .map((month) => {
      const totals = getTotals(
        transactions.filter((t) => t.date.startsWith(month))
      );
      return { month, income: totals.income, expense: totals.expense };
    });
}

// Agrupa por data, da mais recente para a mais antiga
export function groupByDate(
  transactions: Transaction[]
): [string, Transaction[]][] {
  const groups = transactions.reduce<Record<string, Transaction[]>>(
    (acc, t) => {
      if (!acc[t.date]) {
        acc[t.date] = [];
      }
      acc[t.date].push(t);
      return acc;
    },
    {}
  );

  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
}

// Compara o mês escolhido com o mês anterior
export function compareMonths(
  transactions: Transaction[],
  month: string
): MonthComparison {
  const previous = previousMonth(month);

  return {
    month,
    previousMonth: previous,
    current: getTotals(transactions.filter((t) => t.date.startsWith(month))),
    previous: getTotals(
      transactions.filter((t) => t.date.startsWith(previous))
    ),
  };
}

// Variação percentual. Devolve null quando não há base de comparação.
export function percentChange(current: number, previous: number) {
  if (previous === 0) {
    return null;
  }
  return Math.round(((current - previous) / previous) * 100);
}

// Mês usado em orçamentos, meta e comparação:
// o mês escolhido ou, em "Todos", o mais recente dos dados.
export function referenceMonth(
  transactions: Transaction[],
  selectedMonth: string
): string | null {
  if (selectedMonth !== "all") {
    return selectedMonth;
  }
  return getMonths(transactions)[0] ?? null;
}

// Quanto do limite já foi usado e em que nível de alerta está
export function budgetStatus(spent: number, limit: number) {
  const pct = limit > 0 ? (spent / limit) * 100 : 0;
  const level: BudgetLevel = pct > 100 ? "over" : pct >= 80 ? "warning" : "ok";
  return { pct, level };
}

// Gera uma transação por mês: serve para parcelas e para contas recorrentes.
// Com count > 1, a descrição ganha o sufixo (1/6), (2/6)...
export function expandInstallments(
  base: Omit<Transaction, "id">,
  count: number,
  firstId: number
): Transaction[] {
  return Array.from({ length: count }, (_, index) => ({
    ...base,
    id: firstId + index,
    date: addMonths(base.date, index),
    description:
      count > 1 ? `${base.description} (${index + 1}/${count})` : base.description,
  }));
}

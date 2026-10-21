import { useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import {
  compareMonths,
  expensesByCategory,
  filterTransactions,
  getMonths,
  getTotals,
  monthlySeries,
  referenceMonth,
} from "@/lib/finance";

// Calcula tudo o que a tela precisa a partir do estado e dos filtros.
// O useMemo guarda cada resultado e só refaz a conta quando os dados mudam.
export function useDashboardData(
  selectedMonth: string,
  search: string,
  category: string
) {
  const { state } = useFinance();
  const { transactions, budgets, goal } = state;

  const months = useMemo(() => getMonths(transactions), [transactions]);

  // se o mês escolhido deixou de existir, volta para "Todos"
  const activeMonth = months.includes(selectedMonth) ? selectedMonth : "all";

  const periodTransactions = useMemo(
    () =>
      filterTransactions(transactions, {
        month: activeMonth,
        search: "",
        category: "all",
      }),
    [transactions, activeMonth]
  );

  const visibleTransactions = useMemo(
    () =>
      filterTransactions(transactions, {
        month: activeMonth,
        search,
        category,
      }),
    [transactions, activeMonth, search, category]
  );

  const totals = useMemo(() => getTotals(periodTransactions), [periodTransactions]);

  const categoryData = useMemo(
    () => expensesByCategory(periodTransactions),
    [periodTransactions]
  );

  const monthly = useMemo(() => monthlySeries(transactions), [transactions]);

  const refMonth = useMemo(
    () => referenceMonth(transactions, activeMonth),
    [transactions, activeMonth]
  );

  const comparison = useMemo(
    () => (refMonth ? compareMonths(transactions, refMonth) : null),
    [transactions, refMonth]
  );

  // gastos do mês de referência, por categoria, para comparar com os orçamentos
  const spentByCategory = useMemo(() => {
    const monthTransactions = refMonth
      ? filterTransactions(transactions, {
          month: refMonth,
          search: "",
          category: "all",
        })
      : [];
    return Object.fromEntries(
      expensesByCategory(monthTransactions).map((item) => [item.name, item.value])
    );
  }, [transactions, refMonth]);

  return {
    transactions,
    budgets,
    goal,
    months,
    activeMonth,
    visibleTransactions,
    totals,
    categoryData,
    monthly,
    refMonth,
    comparison,
    spentByCategory,
  };
}

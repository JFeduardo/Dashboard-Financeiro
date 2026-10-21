"use client";

import { useState } from "react";
import type { Transaction } from "@/types/transaction";
import { useFinance } from "@/context/FinanceContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { ALL_CATEGORIES } from "@/lib/constants";
import { expandInstallments } from "@/lib/finance";
import { monthLongLabel } from "@/lib/format";
import type { TransactionFormValues } from "@/lib/schemas";
import { BalanceHero } from "@/components/BalanceHero";
import { BudgetPanel } from "@/components/BudgetPanel";
import { ChartsPanel } from "@/components/ChartsPanel";
import { DataTools } from "@/components/DataTools";
import { GoalPanel } from "@/components/GoalPanel";
import { PeriodNav } from "@/components/PeriodNav";
import { TransactionFilters } from "@/components/TransactionFilters";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";

export function Dashboard() {
  const { dispatch } = useFinance();

  const [selectedMonth, setSelectedMonth] = useState("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [editingId, setEditingId] = useState<number | null>(null);

  const data = useDashboardData(selectedMonth, search, category);
  const editing = data.transactions.find((t) => t.id === editingId);

  const balanceLabel =
    data.activeMonth === "all"
      ? "Saldo de todos os meses"
      : `Saldo de ${monthLongLabel(data.activeMonth)}`;

  const refMonthLabel = data.refMonth ? monthLongLabel(data.refMonth) : null;

  function handleSubmit(values: TransactionFormValues) {
    const { installments, ...base } = values;

    if (editing) {
      dispatch({ type: "update", transaction: { ...base, id: editing.id } });
      setEditingId(null);
      return;
    }

    dispatch({
      type: "add",
      transactions: expandInstallments(base, installments, Date.now()),
    });
  }

  function handleDelete(id: number) {
    dispatch({ type: "delete", id });
    if (id === editingId) {
      setEditingId(null);
    }
  }

  function handleEdit(transaction: Transaction) {
    setEditingId(transaction.id);
  }

  return (
    <main className="min-h-screen bg-[#140D1F] text-[#EDE7F6]">
      <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            Dashboard Financeiro
          </h1>
          <PeriodNav
            months={data.months}
            active={data.activeMonth}
            onChange={setSelectedMonth}
          />
        </header>

        <div className="grid gap-8 lg:grid-cols-[360px_1fr] lg:items-start">
          <aside className="space-y-6">
            <BalanceHero
              label={balanceLabel}
              totals={data.totals}
              comparison={data.activeMonth === "all" ? null : data.comparison}
            />

            {/* a chave faz o formulário reiniciar ao trocar entre criar e editar */}
            <TransactionForm
              key={editing?.id ?? "new"}
              editing={editing}
              onSubmit={handleSubmit}
              onCancel={() => setEditingId(null)}
            />

            <GoalPanel
              goal={data.goal}
              monthLabel={refMonthLabel}
              saved={data.comparison?.current.balance ?? 0}
              onChange={(goal) => dispatch({ type: "setGoal", goal })}
            />
          </aside>

          <div className="space-y-10">
            <ChartsPanel
              categoryData={data.categoryData}
              monthly={data.monthly}
              comparison={data.comparison}
            />

            <BudgetPanel
              budgets={data.budgets}
              spent={data.spentByCategory}
              monthLabel={refMonthLabel}
              onChange={(cat, limit) =>
                dispatch({ type: "setBudget", category: cat, limit })
              }
            />

            <section>
              <h2 className="text-lg font-semibold">Transações</h2>
              <TransactionFilters
                search={search}
                category={category}
                categories={ALL_CATEGORIES}
                onSearchChange={setSearch}
                onCategoryChange={setCategory}
              />
              <TransactionList
                transactions={data.visibleTransactions}
                editingId={editingId}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </section>

            <DataTools
              transactions={data.transactions}
              onImport={(imported) =>
                dispatch({ type: "import", transactions: imported })
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}

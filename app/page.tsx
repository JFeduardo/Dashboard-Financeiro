"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { transactions as initialTransactions } from "@/data/transaction";
import type { Transaction } from "@/types/transaction";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatMonth(month: string) {
  return month.split("-").reverse().join("/");
}

export default function Home() {
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [loaded, setLoaded] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState("all");

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("transactions");
      if (saved) {
        setTransactions(JSON.parse(saved));
      }
    } catch {
      // se o dado salvo estiver corrompido, mantém os dados de exemplo
    }
    setLoaded(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("transactions", JSON.stringify(transactions));
    }
  }, [transactions, loaded]);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");

  const months = Array.from(
    new Set(transactions.map((t) => t.date.slice(0, 7)))
  )
    .sort()
    .reverse();

  const filteredTransactions =
    selectedMonth === "all"
      ? transactions
      : transactions.filter((t) => t.date.startsWith(selectedMonth));

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const expensesByCategory = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount;
      return acc;
    }, {});

  const chartData = Object.entries(expensesByCategory).map(
    ([name, value]) => ({ name, value })
  );

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newTransaction: Transaction = {
      id: Date.now(),
      description: description.trim(),
      amount: Number(amount),
      type,
      category: category.trim(),
      date: new Date().toISOString().slice(0, 10),
    };

    setTransactions([newTransaction, ...transactions]);

    setDescription("");
    setAmount("");
    setType("expense");
    setCategory("");
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Dashboard Financeiro</h1>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded border border-gray-300 bg-transparent p-2"
        >
          <option value="all">Todos</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {formatMonth(month)}
            </option>
          ))}
        </select>
      </div>

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-300 p-4">
          <p className="text-sm text-gray-500">Receitas</p>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(totalIncome)}
          </p>
        </div>

        <div className="rounded-lg border border-gray-300 p-4">
          <p className="text-sm text-gray-500">Despesas</p>
          <p className="text-xl font-bold text-red-600">
            {formatCurrency(totalExpense)}
          </p>
        </div>

        <div className="rounded-lg border border-gray-300 p-4">
          <p className="text-sm text-gray-500">Saldo</p>
          <p className="text-xl font-bold">{formatCurrency(balance)}</p>
        </div>
      </section>

      <section className="mb-8 rounded-lg border border-gray-300 p-4">
        <h2 className="mb-4 font-semibold">Despesas por categoria</h2>

        {chartData.length === 0 ? (
          <p className="text-sm text-gray-500">Sem despesas neste período.</p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="value" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <form
        onSubmit={handleSubmit}
        className="mb-8 grid grid-cols-1 gap-3 rounded-lg border border-gray-300 p-4 sm:grid-cols-2"
      >
        <input
          type="text"
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="rounded border border-gray-300 bg-transparent p-2"
        />

        <input
          type="number"
          placeholder="Valor"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0.01"
          step="0.01"
          required
          className="rounded border border-gray-300 bg-transparent p-2"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value as "income" | "expense")}
          className="rounded border border-gray-300 bg-transparent p-2"
        >
          <option value="expense">Despesa</option>
          <option value="income">Receita</option>
        </select>

        <input
          type="text"
          placeholder="Categoria"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="rounded border border-gray-300 bg-transparent p-2"
        />

        <button
          type="submit"
          className="rounded bg-green-600 p-2 font-semibold text-white sm:col-span-2"
        >
          Adicionar transação
        </button>
      </form>

      <ul className="space-y-3">
        {filteredTransactions.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between rounded-lg border border-gray-300 p-4"
          >
            <div>
              <p className="font-medium">{t.description}</p>
              <p className="text-sm text-gray-500">
                {t.category} · {t.date}
              </p>
            </div>

            <span
              className={
                t.type === "income"
                  ? "font-semibold text-green-600"
                  : "font-semibold text-red-600"
              }
            >
              {t.type === "income" ? "+" : "-"} {formatCurrency(t.amount)}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}

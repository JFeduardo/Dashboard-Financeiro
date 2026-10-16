"use client";
 
import { useState } from "react";
import type { FormEvent } from "react";
import { transactions as initialTransactions } from "@/data/transaction";
import type { Transaction } from "@/types/transaction";
 
function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
 
export default function Home() {
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
 
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
 
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
 
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
 
  const balance = totalIncome - totalExpense;
 
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
      <h1 className="mb-6 text-2xl font-bold">Dashboard Financeiro</h1>
 
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
        {transactions.map((t) => (
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
 
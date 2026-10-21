"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Transaction } from "@/types/transaction";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/constants";
import { todayISO } from "@/lib/dates";
import { fieldErrors, transactionFormSchema } from "@/lib/schemas";
import type { TransactionFormValues } from "@/lib/schemas";
import {
  errorClass,
  inputClass,
  labelClass,
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/ui";

type Props = {
  editing?: Transaction; // quando existe, o formulário edita em vez de criar
  onSubmit: (values: TransactionFormValues) => void;
  onCancel?: () => void;
};

export function TransactionForm({ editing, onSubmit, onCancel }: Props) {
  const [type, setType] = useState<"income" | "expense">(
    editing?.type ?? "expense"
  );
  const [description, setDescription] = useState(editing?.description ?? "");
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [category, setCategory] = useState(editing?.category ?? "");
  const [date, setDate] = useState(editing?.date ?? "");
  const [installments, setInstallments] = useState("1");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Em um formulário novo, preenche a data de hoje (depois que a página abre no navegador)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!editing) {
      setDate(todayISO());
    }
  }, [editing]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const categoryOptions =
    type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  function handleTypeChange(next: "income" | "expense") {
    setType(next);
    setCategory("");
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // O Zod confere todos os campos de uma vez
    const result = transactionFormSchema.safeParse({
      description,
      amount: amount.trim() === "" ? NaN : Number(amount.replace(",", ".")),
      type,
      category,
      date,
      installments: Number(installments),
    });

    if (!result.success) {
      setErrors(fieldErrors(result.error));
      return;
    }

    setErrors({});
    onSubmit(result.data);

    if (!editing) {
      setDescription("");
      setAmount("");
      setCategory("");
      setInstallments("1");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label={editing ? "Editar transação" : "Nova transação"}
      className={`${panelClass} space-y-4`}
    >
      <h2 className="text-lg font-semibold">
        {editing ? "Editar transação" : "Nova transação"}
      </h2>

      <div
        role="group"
        aria-label="Tipo da transação"
        className="grid grid-cols-2 gap-1 rounded-xl bg-[#140D1F] p-1"
      >
        {(["expense", "income"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={type === option}
            onClick={() => handleTypeChange(option)}
            className={`rounded-lg py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[#F5B94A] ${
              type === option
                ? "bg-[#281C3F] text-[#EDE7F6]"
                : "text-[#A596C0] hover:text-[#EDE7F6]"
            }`}
          >
            {option === "expense" ? "Despesa" : "Receita"}
          </button>
        ))}
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Descrição
        </label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex.: Supermercado"
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? "description-error" : undefined}
          className={inputClass}
        />
        {errors.description && (
          <p id="description-error" role="alert" className={errorClass}>
            {errors.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="amount" className={labelClass}>
            Valor (R$)
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            aria-invalid={Boolean(errors.amount)}
            aria-describedby={errors.amount ? "amount-error" : undefined}
            className={inputClass}
          />
          {errors.amount && (
            <p id="amount-error" role="alert" className={errorClass}>
              {errors.amount}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="date" className={labelClass}>
            Data
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-invalid={Boolean(errors.date)}
            aria-describedby={errors.date ? "date-error" : undefined}
            className={inputClass}
          />
          {errors.date && (
            <p id="date-error" role="alert" className={errorClass}>
              {errors.date}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="category" className={labelClass}>
          Categoria
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-invalid={Boolean(errors.category)}
          aria-describedby={errors.category ? "category-error" : undefined}
          className={inputClass}
        >
          <option value="">Selecione a categoria</option>
          {/* ao editar dados antigos, mantém a categoria original como opção */}
          {category && !categoryOptions.includes(category) && (
            <option value={category}>{category}</option>
          )}
          {categoryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {errors.category && (
          <p id="category-error" role="alert" className={errorClass}>
            {errors.category}
          </p>
        )}
      </div>

      {!editing && (
        <div>
          <label htmlFor="installments" className={labelClass}>
            Repetir por quantos meses
          </label>
          <input
            id="installments"
            type="number"
            min="1"
            step="1"
            value={installments}
            onChange={(e) => setInstallments(e.target.value)}
            aria-invalid={Boolean(errors.installments)}
            aria-describedby="installments-help"
            className={inputClass}
          />
          <p
            id="installments-help"
            className={errors.installments ? errorClass : "mt-1 text-sm text-[#6F6190]"}
          >
            {errors.installments ??
              "Use 1 para uma transação única. Acima de 1, cria uma por mês (parcelas ou conta recorrente)."}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button type="submit" className={`${primaryButtonClass} flex-1`}>
          {editing ? "Salvar alterações" : "Adicionar transação"}
        </button>
        {editing && onCancel && (
          <button type="button" onClick={onCancel} className={secondaryButtonClass}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

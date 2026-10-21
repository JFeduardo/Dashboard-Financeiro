import type { z } from "zod";
import type { Transaction } from "@/types/transaction";
import type { Budgets } from "@/types/finance";
import {
  storedBudgetsSchema,
  storedGoalSchema,
  storedTransactionsSchema,
} from "@/lib/schemas";

// Leitura e escrita no localStorage, sempre com try/catch e validação.
// Se algo estiver ausente ou corrompido, devolve null e o app usa o valor padrão.

const KEYS = {
  transactions: "transactions",
  budgets: "budgets",
  goal: "goal",
};

function read<T>(key: string, schema: z.ZodType<T>): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      return null;
    }
    const result = schema.safeParse(JSON.parse(raw));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // armazenamento cheio ou bloqueado: o app continua funcionando sem salvar
  }
}

export const loadTransactions = () =>
  read<Transaction[]>(KEYS.transactions, storedTransactionsSchema);
export const loadBudgets = () => read<Budgets>(KEYS.budgets, storedBudgetsSchema);
export const loadGoal = () => read<number>(KEYS.goal, storedGoalSchema);

export const saveTransactions = (value: Transaction[]) =>
  write(KEYS.transactions, value);
export const saveBudgets = (value: Budgets) => write(KEYS.budgets, value);
export const saveGoal = (value: number) => write(KEYS.goal, value);

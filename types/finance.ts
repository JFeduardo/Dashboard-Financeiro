import type { Transaction } from "@/types/transaction";

// Limite mensal de gasto por categoria. Exemplo: { Alimentação: 600 }
export type Budgets = Record<string, number>;

// Tudo o que o aplicativo guarda e salva no navegador
export type FinanceState = {
  transactions: Transaction[];
  budgets: Budgets;
  goal: number; // meta de economia por mês (0 = sem meta)
};

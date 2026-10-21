import type { Transaction } from "@/types/transaction";
import type { FinanceState } from "@/types/finance";
import { transactions as sampleTransactions } from "@/data/transaction";

// O reducer é uma função pura: recebe o estado atual e uma ação,
// e devolve o novo estado, sem alterar o antigo.

export type FinanceAction =
  | { type: "hydrate"; state: FinanceState }
  | { type: "add"; transactions: Transaction[] }
  | { type: "update"; transaction: Transaction }
  | { type: "delete"; id: number }
  | { type: "import"; transactions: Transaction[] }
  | { type: "setBudget"; category: string; limit: number | null }
  | { type: "setGoal"; goal: number };

export const initialState: FinanceState = {
  transactions: sampleTransactions,
  budgets: {},
  goal: 0,
};

function sameTransaction(a: Transaction, b: Transaction) {
  return (
    a.date === b.date &&
    a.description === b.description &&
    a.amount === b.amount &&
    a.type === b.type &&
    a.category === b.category
  );
}

export function financeReducer(
  state: FinanceState,
  action: FinanceAction
): FinanceState {
  switch (action.type) {
    case "hydrate":
      return action.state;

    case "add":
      return {
        ...state,
        transactions: [...action.transactions, ...state.transactions],
      };

    case "update":
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.transaction.id ? action.transaction : t
        ),
      };

    case "delete":
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.id),
      };

    case "import": {
      // ignora o que já existe, para importar o mesmo arquivo duas vezes não duplicar
      const fresh = action.transactions.filter(
        (incoming) => !state.transactions.some((t) => sameTransaction(t, incoming))
      );
      return { ...state, transactions: [...fresh, ...state.transactions] };
    }

    case "setBudget": {
      const budgets = { ...state.budgets };
      if (action.limit === null || action.limit <= 0) {
        delete budgets[action.category];
      } else {
        budgets[action.category] = action.limit;
      }
      return { ...state, budgets };
    }

    case "setGoal":
      return { ...state, goal: Math.max(0, action.goal) };

    default:
      return state;
  }
}

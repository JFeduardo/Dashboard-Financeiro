"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import type { Dispatch, ReactNode } from "react";
import type { FinanceState } from "@/types/finance";
import { financeReducer, initialState } from "@/lib/reducer";
import type { FinanceAction } from "@/lib/reducer";
import {
  loadBudgets,
  loadGoal,
  loadTransactions,
  saveBudgets,
  saveGoal,
  saveTransactions,
} from "@/lib/storage";

// O Context (contexto) compartilha o estado com qualquer componente da árvore,
// sem precisar passar props de um componente para o outro.

type FinanceContextValue = {
  state: FinanceState;
  dispatch: Dispatch<FinanceAction>;
  loaded: boolean;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(financeReducer, initialState);
  const [loaded, setLoaded] = useState(false);

  // Ao abrir a página, lê os dados salvos no navegador (uma única vez).
  // A leitura fica no efeito para o servidor e o navegador começarem com o mesmo conteúdo.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    dispatch({
      type: "hydrate",
      state: {
        transactions: loadTransactions() ?? initialState.transactions,
        budgets: loadBudgets() ?? {},
        goal: loadGoal() ?? 0,
      },
    });
    setLoaded(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Sempre que o estado muda (depois da leitura inicial), grava no navegador.
  useEffect(() => {
    if (loaded) {
      saveTransactions(state.transactions);
      saveBudgets(state.budgets);
      saveGoal(state.goal);
    }
  }, [state, loaded]);

  const value = useMemo(() => ({ state, dispatch, loaded }), [state, loaded]);

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  );
}

// Hook próprio: qualquer componente chama useFinance() para ler e alterar os dados
export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance deve ser usado dentro de um FinanceProvider");
  }
  return context;
}

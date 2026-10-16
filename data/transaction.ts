import type { Transaction } from "@/types/transaction";

export const transactions: Transaction[] = [
  { id: 1, description: "Salário", amount: 2500, type: "income", category: "Trabalho", date: "2026-10-05" },
  { id: 2, description: "Aluguel", amount: 800, type: "expense", category: "Moradia", date: "2026-10-06" },
  { id: 3, description: "Supermercado", amount: 320, type: "expense", category: "Alimentação", date: "2026-10-08" },
  { id: 4, description: "Freelance", amount: 600, type: "income", category: "Trabalho", date: "2026-10-10" },
  { id: 5, description: "Internet", amount: 100, type: "expense", category: "Contas", date: "2026-10-11" },
  { id: 6, description: "Ônibus", amount: 90, type: "expense", category: "Transporte", date: "2026-10-12" },
];
import { z } from "zod";
import { isValidDate } from "@/lib/dates";

// Zod confere se os dados têm o formato esperado e devolve mensagens de erro claras.

const dateField = z.string().refine(isValidDate, "Use uma data válida");

// Regras do formulário de transação
export const transactionFormSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Informe uma descrição")
    .max(60, "Use no máximo 60 caracteres"),
  amount: z
    .number("Informe um valor válido")
    .positive("O valor deve ser maior que zero")
    .max(1_000_000_000, "Valor muito alto"),
  type: z.enum(["income", "expense"], "Escolha o tipo"),
  category: z.string().trim().min(1, "Escolha uma categoria"),
  date: dateField,
  installments: z
    .number("Informe um número válido")
    .int("Use um número inteiro")
    .min(1, "Use pelo menos 1")
    .max(60, "Use no máximo 60"),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

// Regras de cada linha do CSV importado (sem o campo de repetições)
export const csvRowSchema = transactionFormSchema.omit({ installments: true });

// Regras para ler do localStorage (dados antigos ou corrompidos são descartados)
export const storedTransactionsSchema = z.array(
  z.object({
    id: z.number(),
    description: z.string(),
    amount: z.number(),
    type: z.enum(["income", "expense"]),
    category: z.string(),
    date: dateField,
  })
);

export const storedBudgetsSchema = z.record(z.string(), z.number().positive());

export const storedGoalSchema = z.number().nonnegative();

// Transforma os erros do Zod em { campo: "mensagem" }
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}

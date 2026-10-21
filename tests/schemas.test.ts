import { describe, expect, it } from "vitest";
import { fieldErrors, transactionFormSchema } from "@/lib/schemas";

const valid = {
  description: "Supermercado",
  amount: 120.5,
  type: "expense" as const,
  category: "Alimentação",
  date: "2026-10-17",
  installments: 1,
};

describe("transactionFormSchema", () => {
  it("aceita dados válidos e remove espaços extras", () => {
    const result = transactionFormSchema.safeParse({
      ...valid,
      description: "  Supermercado  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe("Supermercado");
    }
  });

  it("recusa descrição vazia", () => {
    const result = transactionFormSchema.safeParse({ ...valid, description: "   " });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrors(result.error).description).toBe("Informe uma descrição");
    }
  });

  it("recusa valor zero, negativo ou inválido", () => {
    for (const amount of [0, -10, NaN]) {
      expect(transactionFormSchema.safeParse({ ...valid, amount }).success).toBe(false);
    }
  });

  it("recusa datas que não existem", () => {
    const result = transactionFormSchema.safeParse({ ...valid, date: "2026-02-30" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrors(result.error).date).toBe("Use uma data válida");
    }
  });

  it("recusa categoria vazia e repetições fora do limite", () => {
    const result = transactionFormSchema.safeParse({
      ...valid,
      category: "",
      installments: 61,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = fieldErrors(result.error);
      expect(errors.category).toBe("Escolha uma categoria");
      expect(errors.installments).toBe("Use no máximo 60");
    }
  });
});

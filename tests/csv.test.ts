import { describe, expect, it } from "vitest";
import type { Transaction } from "@/types/transaction";
import { fromCsv, parseCsv, toCsv } from "@/lib/csv";

const sample: Transaction[] = [
  { id: 1, description: "Salário", amount: 2500, type: "income", category: "Trabalho", date: "2026-10-05" },
  { id: 2, description: 'Pizza "da casa"; com borda', amount: 59.9, type: "expense", category: "Alimentação", date: "2026-10-06" },
];

describe("toCsv", () => {
  it("gera cabeçalho e linhas com receita/despesa em português", () => {
    const csv = toCsv(sample);
    expect(csv.split("\n")[0]).toBe("data;descricao;valor;tipo;categoria");
    expect(csv).toContain("2026-10-05;Salário;2500;receita;Trabalho");
  });

  it("protege campos com ponto e vírgula e aspas", () => {
    expect(toCsv(sample)).toContain('"Pizza ""da casa""; com borda"');
  });
});

describe("parseCsv", () => {
  it("entende campos entre aspas e quebras de linha dentro do campo", () => {
    const rows = parseCsv('a;"b;c";"d\ne"\n1;2;3');
    expect(rows).toEqual([
      ["a", "b;c", "d\ne"],
      ["1", "2", "3"],
    ]);
  });
});

describe("fromCsv", () => {
  it("exporta e importa sem perder dados", () => {
    const { transactions, errors } = fromCsv(toCsv(sample), 100);
    expect(errors).toEqual([]);
    expect(transactions).toEqual([
      { ...sample[0], id: 100 },
      { ...sample[1], id: 101 },
    ]);
  });

  it("aceita vírgula decimal, BOM e separador vírgula", () => {
    const csv = "\uFEFFdata,descricao,valor,tipo,categoria\n2026-10-05,Café,\"7,50\",despesa,Alimentação";
    const { transactions, errors } = fromCsv(csv, 1);
    expect(errors).toEqual([]);
    expect(transactions[0].amount).toBe(7.5);
  });

  it("ignora linhas inválidas e informa o número da linha", () => {
    const csv = [
      "data;descricao;valor;tipo;categoria",
      "2026-10-05;Ok;10;despesa;Outros",
      "2026-13-40;Data ruim;10;despesa;Outros",
      "2026-10-06;Valor ruim;-5;despesa;Outros",
    ].join("\n");
    const { transactions, errors } = fromCsv(csv, 1);
    expect(transactions).toHaveLength(1);
    expect(errors).toHaveLength(2);
    expect(errors[0]).toContain("Linha 3");
    expect(errors[1]).toContain("Linha 4");
  });

  it("avisa quando faltam colunas", () => {
    const { transactions, errors } = fromCsv("data;valor\n2026-10-05;10", 1);
    expect(transactions).toEqual([]);
    expect(errors[0]).toContain("Colunas ausentes");
  });

  it("avisa quando o arquivo está vazio", () => {
    expect(fromCsv("", 1).errors).toEqual(["O arquivo está vazio."]);
  });
});

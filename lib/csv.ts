import type { Transaction } from "@/types/transaction";
import { csvRowSchema } from "@/lib/schemas";

const HEADER = ["data", "descricao", "valor", "tipo", "categoria"];
const DELIMITER = ";";

function escapeField(value: string) {
  if (/[;"\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Transações -> texto CSV (separador ponto e vírgula, que o Excel em português abre direto)
export function toCsv(transactions: Transaction[]): string {
  const rows = transactions.map((t) =>
    [
      t.date,
      t.description,
      String(t.amount),
      t.type === "income" ? "receita" : "despesa",
      t.category,
    ]
      .map(escapeField)
      .join(DELIMITER)
  );

  return [HEADER.join(DELIMITER), ...rows].join("\n");
}

// Lê texto CSV e devolve uma lista de linhas, cada uma com uma lista de campos.
// Entende campos entre aspas, aspas duplicadas e quebras de linha.
export function parseCsv(text: string, delimiter = DELIMITER): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const content = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (inQuotes) {
      if (char === '"' && content[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && content[i + 1] === "\n") {
        i++;
      }
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

export type ImportResult = { transactions: Transaction[]; errors: string[] };

function parseType(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "receita" || normalized === "income") return "income";
  if (normalized === "despesa" || normalized === "expense") return "expense";
  return normalized;
}

// Texto CSV -> transações válidas + lista de erros por linha
export function fromCsv(text: string, firstId: number): ImportResult {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = firstLine.includes(";") ? ";" : ",";
  const rows = parseCsv(text, delimiter);

  if (rows.length === 0) {
    return { transactions: [], errors: ["O arquivo está vazio."] };
  }

  const header = rows[0].map((cell) => cell.trim().toLowerCase());
  const index = Object.fromEntries(HEADER.map((name) => [name, header.indexOf(name)]));
  const missing = HEADER.filter((name) => index[name] === -1);

  if (missing.length > 0) {
    return {
      transactions: [],
      errors: [`Colunas ausentes: ${missing.join(", ")}.`],
    };
  }

  const transactions: Transaction[] = [];
  const errors: string[] = [];

  rows.slice(1).forEach((row, i) => {
    const line = i + 2;
    const result = csvRowSchema.safeParse({
      date: (row[index.data] ?? "").trim(),
      description: row[index.descricao] ?? "",
      amount: Number((row[index.valor] ?? "").trim().replace(",", ".")),
      type: parseType(row[index.tipo] ?? ""),
      category: row[index.categoria] ?? "",
    });

    if (!result.success) {
      errors.push(`Linha ${line}: ${result.error.issues[0].message}.`);
      return;
    }

    transactions.push({ ...result.data, id: firstId + transactions.length });
  });

  return { transactions, errors };
}

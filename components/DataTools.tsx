"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { Transaction } from "@/types/transaction";
import { fromCsv, toCsv } from "@/lib/csv";
import { secondaryButtonClass } from "@/components/ui";

type Props = {
  transactions: Transaction[];
  onImport: (transactions: Transaction[]) => void;
};

export function DataTools({ transactions, onImport }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  function handleExport() {
    // O BOM (\uFEFF) faz o Excel reconhecer os acentos corretamente
    const blob = new Blob(["\uFEFF" + toCsv(transactions)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transacoes.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const result = fromCsv(await file.text(), Date.now());
    onImport(result.transactions);
    setErrors(result.errors);
    setMessage(
      `${result.transactions.length} transação(ões) lida(s) do arquivo` +
        (result.errors.length > 0
          ? `, ${result.errors.length} linha(s) ignorada(s).`
          : ".")
    );

    // permite escolher o mesmo arquivo de novo
    e.target.value = "";
  }

  return (
    <section>
      <h2 className="text-lg font-semibold">Exportar e importar</h2>
      <p className="mt-1 text-sm text-[#A596C0]">
        O arquivo CSV tem as colunas data, descricao, valor, tipo e categoria.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={handleExport} className={secondaryButtonClass}>
          Exportar CSV
        </button>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className={secondaryButtonClass}
        >
          Importar CSV
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFile}
          aria-label="Escolher arquivo CSV"
          className="sr-only"
        />
      </div>

      {message && (
        <p role="status" className="mt-3 text-sm text-[#A596C0]">
          {message}
        </p>
      )}
      {errors.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm text-[#FF7A8A]">
          {errors.slice(0, 5).map((error) => (
            <li key={error}>{error}</li>
          ))}
          {errors.length > 5 && <li>E mais {errors.length - 5} erro(s).</li>}
        </ul>
      )}
    </section>
  );
}

import { transactions } from "@/data/transaction";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Dashboard Financeiro</h1>

      <ul className="space-y-3">
        {transactions.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between rounded-lg border border-gray-300 p-4"
          >
            <div>
              <p className="font-medium">{t.description}</p>
              <p className="text-sm text-gray-500">
                {t.category} · {t.date}
              </p>
            </div>

            <span
              className={
                t.type === "income"
                  ? "font-semibold text-green-600"
                  : "font-semibold text-red-600"
              }
            >
              {t.type === "income" ? "+" : "-"} R$ {t.amount.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}

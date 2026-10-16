import { transactions } from "@/data/transaction";
 
function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
 
export default function Home() {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
 
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
 
  const balance = totalIncome - totalExpense;
 
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Dashboard Financeiro</h1>
 
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-300 p-4">
          <p className="text-sm text-gray-500">Receitas</p>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(totalIncome)}
          </p>
        </div>
 
        <div className="rounded-lg border border-gray-300 p-4">
          <p className="text-sm text-gray-500">Despesas</p>
          <p className="text-xl font-bold text-red-600">
            {formatCurrency(totalExpense)}
          </p>
        </div>
 
        <div className="rounded-lg border border-gray-300 p-4">
          <p className="text-sm text-gray-500">Saldo</p>
          <p className="text-xl font-bold">{formatCurrency(balance)}</p>
        </div>
      </section>
 
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
              {t.type === "income" ? "+" : "-"} {formatCurrency(t.amount)}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
 
import type { MonthComparison, Totals } from "@/lib/finance";
import { percentChange } from "@/lib/finance";
import { formatCurrency, monthShortLabel } from "@/lib/format";
import { panelClass } from "@/components/ui";

type Props = {
  label: string;
  totals: Totals;
  comparison: MonthComparison | null; // só quando há um mês escolhido
};

export function BalanceHero({ label, totals, comparison }: Props) {
  const total = totals.income + totals.expense;
  const incomePct = total > 0 ? (totals.income / total) * 100 : 0;
  const expensePct = total > 0 ? 100 - incomePct : 0;

  const expenseChange = comparison
    ? percentChange(comparison.current.expense, comparison.previous.expense)
    : null;

  return (
    <section className={panelClass}>
      <p className="text-sm text-[#A596C0]">{label}</p>
      <p
        className={`mt-2 break-words text-[2.5rem] font-semibold leading-none tracking-tight tabular-nums ${
          totals.balance < 0 ? "text-[#FF7A8A]" : "text-[#EDE7F6]"
        }`}
      >
        {formatCurrency(totals.balance)}
      </p>

      <div
        role="img"
        aria-label={`Receitas de ${formatCurrency(totals.income)} e despesas de ${formatCurrency(totals.expense)}`}
        className="mt-6 flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-[#36284F]"
      >
        <div
          className="bg-[#4FD1A5] transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${incomePct}%` }}
        />
        <div
          className="bg-[#FF7A8A] transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${expensePct}%` }}
        />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <dt className="flex items-center gap-2 text-sm text-[#A596C0]">
            <span className="size-2 rounded-full bg-[#4FD1A5]" />
            Receitas
          </dt>
          <dd className="mt-1 text-lg font-medium tabular-nums">
            {formatCurrency(totals.income)}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 text-sm text-[#A596C0]">
            <span className="size-2 rounded-full bg-[#FF7A8A]" />
            Despesas
          </dt>
          <dd className="mt-1 text-lg font-medium tabular-nums">
            {formatCurrency(totals.expense)}
          </dd>
        </div>
      </dl>

      {comparison && expenseChange !== null && (
        <p className="mt-4 text-sm text-[#A596C0]">
          {expenseChange === 0
            ? `Despesas iguais às de ${monthShortLabel(comparison.previousMonth)}.`
            : `Despesas ${Math.abs(expenseChange)}% ${
                expenseChange > 0 ? "maiores" : "menores"
              } do que em ${monthShortLabel(comparison.previousMonth)}.`}
        </p>
      )}
    </section>
  );
}

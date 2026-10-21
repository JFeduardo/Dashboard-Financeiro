import { EXPENSE_CATEGORIES, CATEGORY_COLORS, FALLBACK_COLOR } from "@/lib/constants";
import { budgetStatus } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";
import { inputClass } from "@/components/ui";

type Props = {
  budgets: Record<string, number>;
  spent: Record<string, number>; // gasto no mês de referência, por categoria
  monthLabel: string | null;
  onChange: (category: string, limit: number | null) => void;
};

const LEVEL_STYLES = {
  ok: { bar: "bg-[#4FD1A5]", text: "text-[#A596C0]" },
  warning: { bar: "bg-[#F5B94A]", text: "text-[#F5B94A]" },
  over: { bar: "bg-[#FF7A8A]", text: "text-[#FF7A8A]" },
};

export function BudgetPanel({ budgets, spent, monthLabel, onChange }: Props) {
  return (
    <section>
      <h2 className="text-lg font-semibold">Orçamento por categoria</h2>
      <p className="mt-1 text-sm text-[#A596C0]">
        {monthLabel
          ? `Limites mensais comparados com os gastos de ${monthLabel}.`
          : "Defina limites mensais por categoria."}
      </p>

      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {EXPENSE_CATEGORIES.map((category) => {
          const limit = budgets[category];
          const spentValue = spent[category] ?? 0;
          const status = limit ? budgetStatus(spentValue, limit) : null;
          const styles = status ? LEVEL_STYLES[status.level] : null;

          return (
            <li key={category} className="rounded-xl border border-[#36284F] p-4">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor={`budget-${category}`}
                  className="flex items-center gap-2 font-medium"
                >
                  <span
                    aria-hidden="true"
                    className="size-2.5 rounded-full"
                    style={{
                      backgroundColor: CATEGORY_COLORS[category] ?? FALLBACK_COLOR,
                    }}
                  />
                  {category}
                </label>
                <input
                  id={`budget-${category}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={limit ?? ""}
                  onChange={(e) =>
                    onChange(category, e.target.value === "" ? null : Number(e.target.value))
                  }
                  placeholder="Limite"
                  aria-label={`Limite mensal de ${category}`}
                  className={`${inputClass} !mt-0 w-28 text-right`}
                />
              </div>

              {status && styles && limit ? (
                <div className="mt-3">
                  <div
                    role="progressbar"
                    aria-label={`Uso do orçamento de ${category}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.min(Math.round(status.pct), 100)}
                    className="h-2 overflow-hidden rounded-full bg-[#36284F]"
                  >
                    <div
                      className={`h-full transition-[width] duration-500 motion-reduce:transition-none ${styles.bar}`}
                      style={{ width: `${Math.min(status.pct, 100)}%` }}
                    />
                  </div>
                  <p className={`mt-2 text-sm ${styles.text}`}>
                    {formatCurrency(spentValue)} de {formatCurrency(limit)}
                    {status.level === "warning" && " · perto do limite"}
                    {status.level === "over" &&
                      ` · estourou em ${formatCurrency(spentValue - limit)}`}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-[#6F6190]">Sem limite definido.</p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

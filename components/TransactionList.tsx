import type { Transaction } from "@/types/transaction";
import { CATEGORY_COLORS, FALLBACK_COLOR } from "@/lib/constants";
import { groupByDate } from "@/lib/finance";
import { dayLabel, formatCurrency } from "@/lib/format";
import { emptyClass } from "@/components/ui";

type Props = {
  transactions: Transaction[];
  editingId: number | null;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
};

const iconButton =
  "rounded-md p-1.5 text-[#6F6190] transition-colors focus-visible:outline-2 focus-visible:outline-[#F5B94A]";

export function TransactionList({
  transactions,
  editingId,
  onEdit,
  onDelete,
}: Props) {
  if (transactions.length === 0) {
    return (
      <p className={`mt-4 ${emptyClass}`}>
        Nenhuma transação encontrada. Ajuste os filtros ou adicione uma nova no
        formulário.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-6">
      {groupByDate(transactions).map(([date, items]) => (
        <div key={date}>
          <h3 className="text-sm text-[#A596C0] first-letter:uppercase">
            {dayLabel(date)}
          </h3>

          <ul className="mt-2 divide-y divide-[#36284F] border-y border-[#36284F]">
            {items.map((t) => (
              <li
                key={t.id}
                className={`flex items-center gap-4 py-3 ${
                  editingId === t.id ? "bg-[#281C3F]" : ""
                }`}
              >
                <span
                  aria-hidden="true"
                  className="size-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: CATEGORY_COLORS[t.category] ?? FALLBACK_COLOR,
                  }}
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{t.description}</p>
                  <p className="text-sm text-[#A596C0]">{t.category}</p>
                </div>

                <p
                  className={`font-medium tabular-nums ${
                    t.type === "income" ? "text-[#4FD1A5]" : "text-[#EDE7F6]"
                  }`}
                >
                  {t.type === "income" ? "+" : "−"} {formatCurrency(t.amount)}
                </p>

                <button
                  type="button"
                  onClick={() => onEdit(t)}
                  aria-label={`Editar ${t.description}`}
                  className={`${iconButton} hover:text-[#F5B94A]`}
                >
                  <svg
                    viewBox="0 0 20 20"
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 16l1-4 9-9a1.4 1.4 0 012 2l-9 9-3 2z" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(t.id)}
                  aria-label={`Excluir ${t.description}`}
                  className={`${iconButton} hover:text-[#FF7A8A]`}
                >
                  <svg
                    viewBox="0 0 20 20"
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M5 5l10 10M15 5L5 15" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

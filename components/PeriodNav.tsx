import { monthShortLabel } from "@/lib/format";

type Props = {
  months: string[];
  active: string;
  onChange: (month: string) => void;
};

export function PeriodNav({ months, active, onChange }: Props) {
  return (
    <nav aria-label="Período" className="flex flex-wrap gap-2">
      {["all", ...months].map((month) => {
        const isActive = month === active;
        return (
          <button
            key={month}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(month)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5B94A] ${
              isActive
                ? "bg-[#F5B94A] text-[#140D1F]"
                : "bg-[#1E1530] text-[#A596C0] hover:text-[#EDE7F6]"
            }`}
          >
            {month === "all" ? "Todos" : monthShortLabel(month)}
          </button>
        );
      })}
    </nav>
  );
}

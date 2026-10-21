import { formatCurrency } from "@/lib/format";
import { inputClass, labelClass, panelClass } from "@/components/ui";

type Props = {
  goal: number;
  monthLabel: string | null;
  saved: number; // saldo do mês de referência
  onChange: (goal: number) => void;
};

export function GoalPanel({ goal, monthLabel, saved, onChange }: Props) {
  const progress = goal > 0 ? Math.min(Math.max(saved, 0) / goal, 1) * 100 : 0;
  const reached = goal > 0 && saved >= goal;

  return (
    <section className={panelClass}>
      <h2 className="text-lg font-semibold">Meta de economia</h2>

      <label htmlFor="goal" className={`${labelClass} mt-4`}>
        Quanto quero guardar por mês (R$)
      </label>
      <input
        id="goal"
        type="number"
        min="0"
        step="0.01"
        value={goal === 0 ? "" : goal}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        placeholder="0,00"
        className={inputClass}
      />

      {goal > 0 && monthLabel ? (
        <div className="mt-4">
          <div
            role="progressbar"
            aria-label="Progresso da meta de economia"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            className="h-2.5 overflow-hidden rounded-full bg-[#36284F]"
          >
            <div
              className={`h-full transition-[width] duration-500 motion-reduce:transition-none ${
                reached ? "bg-[#4FD1A5]" : "bg-[#F5B94A]"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-[#A596C0]">
            {reached
              ? `Meta atingida em ${monthLabel}: saldo de ${formatCurrency(saved)}.`
              : `Em ${monthLabel}, o saldo é de ${formatCurrency(saved)}. Faltam ${formatCurrency(
                  goal - Math.max(saved, 0)
                )} para a meta.`}
          </p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-[#A596C0]">
          Defina um valor para acompanhar o progresso mês a mês.
        </p>
      )}
    </section>
  );
}

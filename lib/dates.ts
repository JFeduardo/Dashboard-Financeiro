function pad(value: number) {
  return String(value).padStart(2, "0");
}

// Data de hoje no fuso do usuário, no formato 2026-10-17.
// Só deve ser chamada dentro de efeitos ou de eventos (nunca durante a renderização).
export function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// Soma meses a uma data. Se o dia não existir no mês de destino, usa o último dia.
// Exemplo: addMonths("2026-01-31", 1) -> "2026-02-28"
export function addMonths(date: string, months: number) {
  const [year, month, day] = date.split("-").map(Number);
  const target = new Date(year, month - 1 + months, 1);
  const lastDay = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0
  ).getDate();

  return `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(
    Math.min(day, lastDay)
  )}`;
}

// previousMonth("2026-01") -> "2025-12"
export function previousMonth(month: string) {
  return addMonths(`${month}-01`, -1).slice(0, 7);
}

export function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

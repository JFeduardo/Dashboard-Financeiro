import { MONTH_NAMES } from "@/lib/constants";

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// "2026-10" -> "Out 2026"
export function monthShortLabel(month: string) {
  const [year, m] = month.split("-");
  const name = MONTH_NAMES[Number(m) - 1].slice(0, 3);
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`;
}

// "2026-10" -> "outubro de 2026"
export function monthLongLabel(month: string) {
  const [year, m] = month.split("-");
  return `${MONTH_NAMES[Number(m) - 1]} de ${year}`;
}

// "2026-10-17" -> "sábado, 17 de outubro"
export function dayLabel(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

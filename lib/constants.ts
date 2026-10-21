export const EXPENSE_CATEGORIES = [
  "Alimentação",
  "Moradia",
  "Transporte",
  "Contas",
  "Lazer",
  "Saúde",
  "Outros",
];

export const INCOME_CATEGORIES = ["Trabalho", "Investimentos", "Outros"];

export const ALL_CATEGORIES = Array.from(
  new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])
);

export const CATEGORY_COLORS: Record<string, string> = {
  Alimentação: "#F5B94A",
  Moradia: "#9B7BFF",
  Transporte: "#4FD1C5",
  Contas: "#FF8FA3",
  Lazer: "#7DD3FC",
  Saúde: "#86EFAC",
  Trabalho: "#C4B5FD",
  Investimentos: "#5EEAD4",
  Outros: "#A596C0",
};

export const FALLBACK_COLOR = "#A596C0";

export const MONTH_NAMES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

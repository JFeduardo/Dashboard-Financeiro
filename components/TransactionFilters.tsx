import { inputClass } from "@/components/ui";

type Props = {
  search: string;
  category: string;
  categories: string[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
};

export function TransactionFilters({
  search,
  category,
  categories,
  onSearchChange,
  onCategoryChange,
}: Props) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_200px]">
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar por descrição"
        aria-label="Buscar por descrição"
        className={`${inputClass} !mt-0`}
      />
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        aria-label="Filtrar por categoria"
        className={`${inputClass} !mt-0`}
      >
        <option value="all">Todas as categorias</option>
        {categories.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

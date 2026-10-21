"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CategoryTotal, MonthComparison, MonthlyPoint } from "@/lib/finance";
import { CATEGORY_COLORS, FALLBACK_COLOR } from "@/lib/constants";
import { formatCurrency, monthShortLabel } from "@/lib/format";
import { emptyClass } from "@/components/ui";

type Props = {
  categoryData: CategoryTotal[];
  monthly: MonthlyPoint[];
  comparison: MonthComparison | null;
};

const TABS = [
  { id: "bars", label: "Por categoria" },
  { id: "pie", label: "Divisão" },
  { id: "line", label: "Mês a mês" },
  { id: "compare", label: "Comparativo" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const tooltipProps = {
  cursor: { fill: "rgba(255,255,255,0.04)" },
  contentStyle: {
    background: "#281C3F",
    border: "1px solid #36284F",
    borderRadius: 8,
  },
  itemStyle: { color: "#EDE7F6" },
  labelStyle: { color: "#A596C0" },
};

const legendFormatter = (value: string) => (
  <span style={{ color: "#EDE7F6" }}>{value}</span>
);

const money = (value: unknown) => formatCurrency(Number(value));

function colorOf(category: string) {
  return CATEGORY_COLORS[category] ?? FALLBACK_COLOR;
}

export function ChartsPanel({ categoryData, monthly, comparison }: Props) {
  const [tab, setTab] = useState<TabId>("bars");

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Gráficos</h2>

        <div role="tablist" aria-label="Tipo de gráfico" className="flex flex-wrap gap-1">
          {TABS.map((item) => (
            <button
              key={item.id}
              id={`tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              aria-controls="charts-panel"
              onClick={() => setTab(item.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[#F5B94A] ${
                tab === item.id
                  ? "bg-[#281C3F] text-[#EDE7F6]"
                  : "text-[#A596C0] hover:text-[#EDE7F6]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div
        id="charts-panel"
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        className="mt-4"
      >
        {tab === "bars" &&
          (categoryData.length === 0 ? (
            <p className={emptyClass}>Sem despesas neste período.</p>
          ) : (
            <div style={{ height: categoryData.length * 48 + 16 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  layout="vertical"
                  margin={{ top: 0, right: 90, bottom: 0, left: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#EDE7F6", fontSize: 14 }}
                  />
                  <Tooltip {...tooltipProps} formatter={money} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {categoryData.map((entry) => (
                      <Cell key={entry.name} fill={colorOf(entry.name)} />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="right"
                      formatter={money}
                      fill="#A596C0"
                      fontSize={13}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ))}

        {tab === "pie" &&
          (categoryData.length === 0 ? (
            <p className={emptyClass}>Sem despesas neste período.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {categoryData.map((entry) => (
                      <Cell key={entry.name} fill={colorOf(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipProps} formatter={money} />
                  <Legend formatter={legendFormatter} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ))}

        {tab === "line" &&
          (monthly.length < 2 ? (
            <p className={emptyClass}>
              Cadastre transações em pelo menos dois meses para ver a evolução.
            </p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthly.map((point) => ({
                    ...point,
                    label: monthShortLabel(point.month),
                  }))}
                  margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
                >
                  <CartesianGrid stroke="#36284F" strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fill: "#A596C0", fontSize: 13 }} />
                  <YAxis
                    width={60}
                    tick={{ fill: "#A596C0", fontSize: 13 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip {...tooltipProps} formatter={money} />
                  <Legend formatter={legendFormatter} />
                  <Line
                    type="monotone"
                    dataKey="income"
                    name="Receitas"
                    stroke="#4FD1A5"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    name="Despesas"
                    stroke="#FF7A8A"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}

        {tab === "compare" &&
          (!comparison ? (
            <p className={emptyClass}>Cadastre transações para comparar meses.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: "Receitas",
                      anterior: comparison.previous.income,
                      atual: comparison.current.income,
                    },
                    {
                      name: "Despesas",
                      anterior: comparison.previous.expense,
                      atual: comparison.current.expense,
                    },
                  ]}
                  margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
                >
                  <CartesianGrid stroke="#36284F" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: "#EDE7F6", fontSize: 14 }} />
                  <YAxis
                    width={60}
                    tick={{ fill: "#A596C0", fontSize: 13 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip {...tooltipProps} formatter={money} />
                  <Legend formatter={legendFormatter} />
                  <Bar
                    dataKey="anterior"
                    name={monthShortLabel(comparison.previousMonth)}
                    fill="#6F6190"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="atual"
                    name={monthShortLabel(comparison.month)}
                    fill="#F5B94A"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ))}
      </div>
    </section>
  );
}

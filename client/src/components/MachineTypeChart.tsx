import { useMemo } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Machine } from "../types/machine";

interface MachineTypeChartProps {
  machines: Machine[];
}

// Fixed categorical order — CVD-validated against the navy-900 (#0f172a) card
// surface. Color is keyed by type name (not array position) so it stays
// stable if a type disappears from the data.
const colorByType: Record<string, string> = {
  Ekskavatör: "#3987e5",
  Vinç: "#199e70",
  Kamyon: "#c98500",
  "Beton Pompası": "#008300",
  Silindir: "#9085e9",
  Diğer: "#e66767",
};

const typeOrder = Object.keys(colorByType);
const fallbackColor = "#94a3b8";

interface TooltipPayloadItem {
  payload: { type: string; count: number; percent: number };
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload?.length) return null;
  const { type, count, percent } = payload[0].payload;

  return (
    <div className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-white">{type}</p>
      <p className="text-slate-300">
        {count} adet · %{Math.round(percent * 100)}
      </p>
    </div>
  );
}

export function MachineTypeChart({ machines }: MachineTypeChartProps) {
  const data = useMemo(() => {
    const countByType = new Map<string, number>();
    machines.forEach((machine) => {
      countByType.set(machine.type, (countByType.get(machine.type) ?? 0) + 1);
    });

    const total = machines.length || 1;
    const entries = [...countByType.entries()].map(([type, count]) => ({
      type,
      count,
      percent: count / total,
    }));

    return entries.sort((a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type));
  }, [machines]);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <Pie
          data={data}
          dataKey="count"
          nameKey="type"
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
          stroke="none"
        >
          {data.map((entry) => (
            <Cell key={entry.type} fill={colorByType[entry.type] ?? fallbackColor} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => <span className="text-xs text-slate-300">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

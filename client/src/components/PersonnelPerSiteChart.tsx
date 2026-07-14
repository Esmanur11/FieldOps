import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Personnel } from "../types/personnel";
import type { Site } from "../types/site";

interface PersonnelPerSiteChartProps {
  personnel: Personnel[];
  sites: Site[];
}

interface TooltipPayloadItem {
  payload: { siteName: string; count: number };
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload?.length) return null;
  const { siteName, count } = payload[0].payload;

  return (
    <div className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-white">{siteName}</p>
      <p className="text-slate-300">{count} personel</p>
    </div>
  );
}

export function PersonnelPerSiteChart({ personnel, sites }: PersonnelPerSiteChartProps) {
  const data = useMemo(() => {
    const countBySite = new Map<number, number>();
    personnel.forEach((person) => {
      countBySite.set(person.siteId, (countBySite.get(person.siteId) ?? 0) + 1);
    });

    return sites
      .map((site) => ({
        siteName: site.name,
        shortName: site.name.split(" ")[0],
        count: countBySite.get(site.id) ?? 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [personnel, sites]);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="0" />
        <XAxis
          dataKey="shortName"
          tick={{ fill: "#94a3b8", fontSize: 12 }}
          axisLine={{ stroke: "#334155" }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: "#94a3b8", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(51, 65, 85, 0.3)" }} />
        <Bar dataKey="count" fill="#F97316" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

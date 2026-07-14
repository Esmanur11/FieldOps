import { useEffect, useState } from "react";
import { Card } from "../components/Card";
import { Layout } from "../components/Layout";
import { getSites } from "../lib/api";
import type { Site } from "../types/site";

interface KpiCardProps {
  label: string;
  value: string;
  comingSoon?: boolean;
}

function KpiCard({ label, value, comingSoon = false }: KpiCardProps) {
  return (
    <Card className={`p-6 ${comingSoon ? "opacity-50" : ""}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p
        className={`mt-2 text-3xl font-semibold ${
          comingSoon ? "text-slate-500" : "text-white"
        }`}
      >
        {value}
      </p>
    </Card>
  );
}

export function DashboardPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    getSites()
      .then(setSites)
      .catch((err) =>
        setLoadError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu"),
      )
      .finally(() => setIsLoading(false));
  }, []);

  const totalSites = sites.length;
  const activeSites = sites.filter((site) => site.status === "active").length;

  return (
    <Layout title="FieldOps — Genel Bakış">
      {loadError && <p className="mb-6 text-sm text-red-400">{loadError}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Toplam Şantiye" value={isLoading ? "…" : String(totalSites)} />
        <KpiCard label="Aktif Şantiye" value={isLoading ? "…" : String(activeSites)} />
        <KpiCard label="Personnel" value="Yakında" comingSoon />
        <KpiCard label="Machines" value="Yakında" comingSoon />
        <KpiCard label="Materials" value="Yakında" comingSoon />
        <KpiCard label="Audits" value="Yakında" comingSoon />
      </div>
    </Layout>
  );
}

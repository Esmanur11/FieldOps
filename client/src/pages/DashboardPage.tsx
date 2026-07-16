import { useEffect, useState } from "react";
import { Card } from "../components/Card";
import { Layout } from "../components/Layout";
import { MachineTypeChart } from "../components/MachineTypeChart";
import { PersonnelPerSiteChart } from "../components/PersonnelPerSiteChart";
import { SitesMap } from "../components/SitesMap";
import {
  getMachines,
  getMaintenancePredictions,
  getMaterials,
  getMaterialStocks,
  getPersonnel,
  getSites,
} from "../lib/api";
import type { Machine } from "../types/machine";
import type { MaintenancePrediction } from "../types/maintenance";
import type { Material, MaterialStock } from "../types/material";
import type { Personnel } from "../types/personnel";
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
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialStocks, setMaterialStocks] = useState<MaterialStock[]>([]);
  const [maintenancePredictions, setMaintenancePredictions] = useState<MaintenancePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getSites(),
      getPersonnel(),
      getMachines(),
      getMaterials(),
      getMaterialStocks(),
      getMaintenancePredictions(),
    ])
      .then(([sitesData, personnelData, machinesData, materialsData, materialStocksData, predictionsData]) => {
        setSites(sitesData);
        setPersonnel(personnelData);
        setMachines(machinesData);
        setMaterials(materialsData);
        setMaterialStocks(materialStocksData);
        setMaintenancePredictions(predictionsData);
      })
      .catch((err) =>
        setLoadError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu"),
      )
      .finally(() => setIsLoading(false));
  }, []);

  const totalSites = sites.length;
  const activeSites = sites.filter((site) => site.status === "active").length;
  const totalPersonnel = personnel.length;
  const totalMachines = machines.length;
  const totalMaterials = materials.length;
  const lowStockCount = materialStocks.filter((stock) => stock.isLowStock).length;
  const highRiskMachineCount = maintenancePredictions.filter(
    (prediction) => prediction.riskScore >= 80,
  ).length;

  return (
    <Layout title="FieldOps — Genel Bakış">
      {loadError && <p className="mb-6 text-sm text-red-400">{loadError}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8">
        <KpiCard label="Toplam Şantiye" value={isLoading ? "…" : String(totalSites)} />
        <KpiCard label="Aktif Şantiye" value={isLoading ? "…" : String(activeSites)} />
        <KpiCard label="Personnel" value={isLoading ? "…" : String(totalPersonnel)} />
        <KpiCard label="Machines" value={isLoading ? "…" : String(totalMachines)} />
        <KpiCard label="Materials" value={isLoading ? "…" : String(totalMaterials)} />
        <KpiCard label="Düşük Stoktaki Malzeme" value={isLoading ? "…" : String(lowStockCount)} />
        <KpiCard label="Yüksek Riskli Makineler" value={isLoading ? "…" : String(highRiskMachineCount)} />
        <KpiCard label="Audits" value="Yakında" comingSoon />
      </div>

      {!isLoading && !loadError && (
        <>
          <Card className="mt-6 p-6">
            <h2 className="mb-4 text-sm font-semibold text-white">Şantiye Konumları</h2>
            <SitesMap sites={sites} />
          </Card>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-6">
              <h2 className="mb-4 text-sm font-semibold text-white">
                Şantiye Başına Personel Sayısı
              </h2>
              <PersonnelPerSiteChart personnel={personnel} sites={sites} />
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-sm font-semibold text-white">Makine Tipi Dağılımı</h2>
              <MachineTypeChart machines={machines} />
            </Card>
          </div>
        </>
      )}
    </Layout>
  );
}

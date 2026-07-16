import {
  AlertTriangle,
  Building2,
  CheckCircle,
  ClipboardCheck,
  ClipboardList,
  Package,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "../components/Card";
import { Layout } from "../components/Layout";
import { MachineTypeChart } from "../components/MachineTypeChart";
import { MaintenanceRiskRadar } from "../components/MaintenanceRiskRadar";
import { PersonnelPerSiteChart } from "../components/PersonnelPerSiteChart";
import { SitesMap } from "../components/SitesMap";
import {
  getAuditFindings,
  getMachines,
  getMaterials,
  getMaterialStocks,
  getPersonnel,
  getShiftAssignments,
  getSites,
  getTopRiskMachines,
  getWorkOrders,
} from "../lib/api";
import type { AuditFinding } from "../types/audit";
import type { Machine } from "../types/machine";
import type { TopRiskMachine } from "../types/maintenance";
import type { Material, MaterialStock } from "../types/material";
import type { Personnel } from "../types/personnel";
import type { ShiftAssignment } from "../types/shift";
import type { Site } from "../types/site";
import type { WorkOrder } from "../types/workOrder";

const todayDateString = new Date().toISOString().slice(0, 10);

const sourceTypeLabels: Record<string, string> = {
  audit_finding: "Denetim",
  maintenance_prediction: "Bakım",
  low_stock: "Stok",
};

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "neutral" | "warning";
  highlight?: string;
}

function KpiCard({ label, value, icon: Icon, tone = "neutral", highlight }: KpiCardProps) {
  const isWarning = tone === "warning";

  return (
    <Card className="p-4">
      <div className="flex items-start gap-2.5">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            isWarning ? "bg-amber-500/10 text-amber-400" : "bg-navy-800 text-slate-400"
          }`}
        >
          <Icon size={15} />
        </span>
        <p className="text-[11px] font-semibold uppercase leading-tight tracking-wide text-slate-400">
          {label}
        </p>
      </div>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {highlight && <p className="mt-1 text-xs font-medium text-red-400">{highlight}</p>}
    </Card>
  );
}

export function DashboardPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialStocks, setMaterialStocks] = useState<MaterialStock[]>([]);
  const [topRiskMachines, setTopRiskMachines] = useState<TopRiskMachine[]>([]);
  const [auditFindings, setAuditFindings] = useState<AuditFinding[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [todayShiftAssignments, setTodayShiftAssignments] = useState<ShiftAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getSites(),
      getPersonnel(),
      getMachines(),
      getMaterials(),
      getMaterialStocks(),
      getTopRiskMachines(5),
      getAuditFindings(),
      getWorkOrders(),
      getShiftAssignments({ date: todayDateString }),
    ])
      .then(
        ([
          sitesData,
          personnelData,
          machinesData,
          materialsData,
          materialStocksData,
          topRiskData,
          auditFindingsData,
          workOrdersData,
          shiftAssignmentsData,
        ]) => {
          setSites(sitesData);
          setPersonnel(personnelData);
          setMachines(machinesData);
          setMaterials(materialsData);
          setMaterialStocks(materialStocksData);
          setTopRiskMachines(topRiskData);
          setAuditFindings(auditFindingsData);
          setWorkOrders(workOrdersData);
          setTodayShiftAssignments(shiftAssignmentsData);
        },
      )
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
  const openFindings = auditFindings.filter((finding) => finding.status === "open");
  const criticalOpenFindingCount = openFindings.filter(
    (finding) => finding.severity === "critical",
  ).length;
  const openWorkOrders = workOrders.filter((workOrder) => workOrder.status === "open");
  const openWorkOrderBreakdown = Object.entries(sourceTypeLabels)
    .map(([sourceType, label]) => ({
      label,
      count: openWorkOrders.filter((wo) => wo.sourceType === sourceType).length,
    }))
    .filter((entry) => entry.count > 0)
    .map((entry) => `${entry.label}: ${entry.count}`)
    .join(" · ");
  const checkedInTodayCount = todayShiftAssignments.filter((a) => a.checkIn !== null).length;

  return (
    <Layout title="FieldOps — Genel Bakış">
      {loadError && <p className="mb-6 text-sm text-red-400">{loadError}</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Toplam Şantiye" value={isLoading ? "…" : String(totalSites)} icon={Building2} />
        <KpiCard label="Aktif Şantiye" value={isLoading ? "…" : String(activeSites)} icon={Building2} />
        <KpiCard label="Personnel" value={isLoading ? "…" : String(totalPersonnel)} icon={Users} />
        <KpiCard label="Machines" value={isLoading ? "…" : String(totalMachines)} icon={Truck} />
        <KpiCard label="Materials" value={isLoading ? "…" : String(totalMaterials)} icon={Package} />
        <KpiCard
          label="Düşük Stoktaki Malzeme"
          value={isLoading ? "…" : String(lowStockCount)}
          icon={AlertTriangle}
          tone="warning"
        />
        <KpiCard
          label="Açık Denetim Bulguları"
          value={isLoading ? "…" : String(openFindings.length)}
          icon={ClipboardCheck}
          tone="warning"
          highlight={
            !isLoading && criticalOpenFindingCount > 0
              ? `${criticalOpenFindingCount} kritik`
              : undefined
          }
        />
        <KpiCard
          label="Açık İş Emirleri"
          value={isLoading ? "…" : String(openWorkOrders.length)}
          icon={ClipboardList}
          tone="warning"
          highlight={!isLoading && openWorkOrderBreakdown ? openWorkOrderBreakdown : undefined}
        />
        <KpiCard
          label="Bugün Check-in Yapan Personel"
          value={isLoading ? "…" : String(checkedInTodayCount)}
          icon={CheckCircle}
        />
      </div>

      {!isLoading && !loadError && (
        <>
          <Card className="mt-6 p-6">
            <h2 className="mb-4 text-sm font-semibold text-white">Şantiye Konumları</h2>
            <SitesMap sites={sites} />
          </Card>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <MaintenanceRiskRadar machines={topRiskMachines} isLoading={isLoading} />
            </div>

            <div className="flex flex-col gap-4">
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
          </div>
        </>
      )}
    </Layout>
  );
}

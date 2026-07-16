import { ArrowLeft, ExternalLink } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Layout } from "../components/Layout";
import { SourceBadge } from "../components/SourceBadge";
import { assignWorkOrder, getPersonnel, getWorkOrderById, updateWorkOrderStatus } from "../lib/api";
import { getSeverityBadgeClasses } from "../lib/severityColor";
import type { Personnel } from "../types/personnel";
import type { WorkOrder } from "../types/workOrder";

interface DetailFieldProps {
  label: string;
  children: ReactNode;
}

function DetailField({ label, children }: DetailFieldProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-base text-white">{children}</p>
    </div>
  );
}

function sourceLink(sourceType: string | null, sourceId: number | null): string | null {
  if (sourceId === null) return null;
  if (sourceType === "audit_finding") return `/audits/${sourceId}`;
  if (sourceType === "maintenance_prediction") return `/machines/${sourceId}`;
  if (sourceType === "low_stock") return "/materials";
  return null;
}

export function WorkOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const workOrderId = Number(id);

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadWorkOrder();
    getPersonnel().then(setPersonnel).catch(() => setPersonnel([]));
  }, [id]);

  async function loadWorkOrder() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getWorkOrderById(workOrderId);
      setWorkOrder(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(status: string) {
    setIsUpdating(true);
    try {
      await updateWorkOrderStatus(workOrderId, status);
      await loadWorkOrder();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Durum güncellenemedi");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleAssign(personnelId: string) {
    setIsUpdating(true);
    try {
      await assignWorkOrder(workOrderId, personnelId === "" ? null : Number(personnelId));
      await loadWorkOrder();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Atama güncellenemedi");
    } finally {
      setIsUpdating(false);
    }
  }

  const link = workOrder ? sourceLink(workOrder.sourceType, workOrder.sourceId) : null;

  return (
    <Layout title="İş Emri Detayı">
      <Link
        to="/work-orders"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white"
      >
        <ArrowLeft size={16} />
        İş Emirlerine dön
      </Link>

      {isLoading ? (
        <p className="text-sm text-slate-400">Yükleniyor...</p>
      ) : loadError ? (
        <p className="text-sm text-red-400">{loadError}</p>
      ) : workOrder ? (
        <div className="flex flex-col gap-6">
          <Card className="max-w-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-semibold text-white">{workOrder.title}</h2>
              <SourceBadge sourceType={workOrder.sourceType} />
            </div>

            {workOrder.description && (
              <p className="mt-3 text-sm text-slate-300">{workOrder.description}</p>
            )}

            {link && (
              <Link
                to={link}
                className="mt-3 inline-flex items-center gap-1 text-sm text-brand-500 hover:underline"
              >
                Kaynağa git
                <ExternalLink size={14} />
              </Link>
            )}

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <DetailField label="Şantiye">{workOrder.siteName}</DetailField>
              <DetailField label="Öncelik">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${getSeverityBadgeClasses(workOrder.priority)}`}
                >
                  {workOrder.priority}
                </span>
              </DetailField>
              <DetailField label="Durum">
                <Badge>{workOrder.status}</Badge>
              </DetailField>
              <DetailField label="Oluşturulma Tarihi">
                {new Date(workOrder.createdAt).toLocaleString("tr-TR")}
              </DetailField>
              <DetailField label="Tamamlanma Tarihi">
                {workOrder.completedAt
                  ? new Date(workOrder.completedAt).toLocaleString("tr-TR")
                  : "—"}
              </DetailField>
              <DetailField label="İş Emri ID">#{workOrder.id}</DetailField>
            </div>
          </Card>

          <Card className="max-w-2xl p-6">
            <h3 className="mb-4 text-sm font-semibold text-white">Durum Değiştir</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={isUpdating || workOrder.status !== "open"}
                onClick={() => handleStatusChange("in_progress")}
              >
                Başlat (in_progress)
              </Button>
              <Button
                disabled={isUpdating || workOrder.status === "completed" || workOrder.status === "cancelled"}
                onClick={() => handleStatusChange("completed")}
              >
                Tamamla (completed)
              </Button>
              <Button
                variant="ghost"
                disabled={isUpdating || workOrder.status === "completed" || workOrder.status === "cancelled"}
                onClick={() => handleStatusChange("cancelled")}
              >
                İptal Et
              </Button>
            </div>
          </Card>

          <Card className="max-w-2xl p-6">
            <h3 className="mb-4 text-sm font-semibold text-white">Personel Ata</h3>
            <select
              value={workOrder.assignedTo ?? ""}
              disabled={isUpdating}
              onChange={(e) => handleAssign(e.target.value)}
              className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
            >
              <option value="">Atanmadı</option>
              {personnel.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.fullName}
                </option>
              ))}
            </select>
          </Card>
        </div>
      ) : null}
    </Layout>
  );
}

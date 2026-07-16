import { Search } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Layout } from "../components/Layout";
import { Modal } from "../components/Modal";
import { SourceBadge } from "../components/SourceBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../components/Table";
import { createWorkOrder, getPersonnel, getSites, getWorkOrders } from "../lib/api";
import { getSeverityBadgeClasses } from "../lib/severityColor";
import type { CreateWorkOrderRequest, WorkOrder } from "../types/workOrder";
import type { Personnel } from "../types/personnel";
import type { Site } from "../types/site";

const emptyForm: CreateWorkOrderRequest = {
  siteId: 0,
  title: "",
  description: "",
  priority: "medium",
  assignedTo: null,
};

const statusFilters = [
  { value: "", label: "Tümü" },
  { value: "open", label: "open" },
  { value: "in_progress", label: "in_progress" },
  { value: "completed", label: "completed" },
  { value: "cancelled", label: "cancelled" },
];

export function WorkOrdersPage() {
  const navigate = useNavigate();

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<CreateWorkOrderRequest>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [workOrdersData, sitesData, personnelData] = await Promise.all([
        getWorkOrders(),
        getSites(),
        getPersonnel(),
      ]);
      setWorkOrders(workOrdersData);
      setSites(sitesData);
      setPersonnel(personnelData);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  }

  function openModal() {
    setForm({ ...emptyForm, siteId: sites[0]?.id ?? 0 });
    setFormError(null);
    setIsModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      await createWorkOrder(form);
      setIsModalOpen(false);
      await loadAll();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  }

  const visibleWorkOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return workOrders.filter((workOrder) => {
      const matchesStatus = !statusFilter || workOrder.status === statusFilter;
      const matchesTerm =
        !term ||
        workOrder.title.toLowerCase().includes(term) ||
        workOrder.siteName.toLowerCase().includes(term);
      return matchesStatus && matchesTerm;
    });
  }, [workOrders, searchTerm, statusFilter]);

  return (
    <Layout
      title="FieldOps — İş Emirleri"
      actions={
        <Button onClick={openModal} disabled={sites.length === 0}>
          + Yeni İş Emri
        </Button>
      }
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="relative w-full max-w-xs">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Şantiye veya başlığa göre ara..."
            className="w-full rounded-lg border border-navy-600 bg-navy-800 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-brand-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
        >
          {statusFilters.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <Card className="p-6">
          <p className="text-sm text-slate-400">Yükleniyor...</p>
        </Card>
      ) : loadError ? (
        <Card className="p-6">
          <p className="text-sm text-red-400">{loadError}</p>
        </Card>
      ) : visibleWorkOrders.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-slate-400">
            {searchTerm || statusFilter
              ? "Aramayla eşleşen iş emri bulunamadı."
              : "Henüz iş emri yok."}
          </p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Şantiye</TableHeaderCell>
                <TableHeaderCell>Başlık</TableHeaderCell>
                <TableHeaderCell>Kaynak</TableHeaderCell>
                <TableHeaderCell>Öncelik</TableHeaderCell>
                <TableHeaderCell>Durum</TableHeaderCell>
                <TableHeaderCell>Atanan</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleWorkOrders.map((workOrder) => (
                <TableRow
                  key={workOrder.id}
                  onClick={() => navigate(`/work-orders/${workOrder.id}`)}
                  className="cursor-pointer"
                >
                  <TableCell>{workOrder.siteName}</TableCell>
                  <TableCell className="font-medium text-white">{workOrder.title}</TableCell>
                  <TableCell>
                    <SourceBadge sourceType={workOrder.sourceType} />
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${getSeverityBadgeClasses(workOrder.priority)}`}
                    >
                      {workOrder.priority}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge>{workOrder.status}</Badge>
                  </TableCell>
                  <TableCell>{workOrder.assignedToName ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {isModalOpen && (
        <Modal title="Yeni İş Emri" onClose={() => setIsModalOpen(false)}>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Şantiye
              <select
                value={form.siteId}
                onChange={(e) => setForm({ ...form, siteId: Number(e.target.value) })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              >
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Başlık
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Açıklama (opsiyonel)
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Öncelik
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
                <option value="critical">critical</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Atanan (opsiyonel)
              <select
                value={form.assignedTo ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    assignedTo: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              >
                <option value="">Atanmadı</option>
                {personnel.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.fullName}
                  </option>
                ))}
              </select>
            </label>

            {formError && <p className="text-sm text-red-400">{formError}</p>}

            <div className="mt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Vazgeç
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}

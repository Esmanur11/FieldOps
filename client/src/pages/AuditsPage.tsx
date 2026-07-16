import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AuditCard } from "../components/AuditCard";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Layout } from "../components/Layout";
import { Modal } from "../components/Modal";
import { Pagination } from "../components/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../components/Table";
import { ViewToggle, type ViewMode } from "../components/ViewToggle";
import { createAudit, getAudits, getPersonnel, getSites } from "../lib/api";
import type { Audit, CreateAuditRequest } from "../types/audit";
import type { Personnel } from "../types/personnel";
import type { Site } from "../types/site";

const emptyForm: CreateAuditRequest = {
  siteId: 0,
  inspectorId: 0,
  auditDate: "",
  type: "",
  status: "completed",
};

const PAGE_SIZE = 10;

type SortKey = "siteName" | "inspectorName" | "auditDate" | "type" | "status";
type SortDirection = "asc" | "desc";

const columns: { key: SortKey; label: string }[] = [
  { key: "siteName", label: "Şantiye" },
  { key: "inspectorName", label: "Denetçi" },
  { key: "auditDate", label: "Tarih" },
  { key: "type", label: "Tip" },
  { key: "status", label: "Durum" },
];

export function AuditsPage() {
  const navigate = useNavigate();

  const [audits, setAudits] = useState<Audit[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("auditDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState<ViewMode>("card");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<CreateAuditRequest>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [auditsData, sitesData, personnelData] = await Promise.all([
        getAudits(),
        getSites(),
        getPersonnel(),
      ]);
      setAudits(auditsData);
      setSites(sitesData);
      setPersonnel(personnelData);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  }

  function openModal() {
    setForm({
      ...emptyForm,
      siteId: sites[0]?.id ?? 0,
      inspectorId: personnel[0]?.id ?? 0,
    });
    setFormError(null);
    setIsModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      await createAudit(form);
      setIsModalOpen(false);
      await loadAll();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

  const visibleAudits = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = term
      ? audits.filter(
          (audit) =>
            audit.siteName.toLowerCase().includes(term) ||
            audit.inspectorName.toLowerCase().includes(term) ||
            audit.type.toLowerCase().includes(term),
        )
      : audits;

    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortKey].toString().toLowerCase();
      const bValue = b[sortKey].toString().toLowerCase();
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [audits, searchTerm, sortKey, sortDirection]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(visibleAudits.length / PAGE_SIZE));
  const paginatedAudits = visibleAudits.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <Layout
      title="FieldOps — Denetim Yönetimi"
      actions={
        <Button onClick={openModal} disabled={sites.length === 0 || personnel.length === 0}>
          + Yeni Denetim Ekle
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
            placeholder="Şantiye, denetçi veya tipe göre ara..."
            className="w-full rounded-lg border border-navy-600 bg-navy-800 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-brand-500"
          />
        </div>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {isLoading ? (
        <Card className="p-6">
          <p className="text-sm text-slate-400">Yükleniyor...</p>
        </Card>
      ) : loadError ? (
        <Card className="p-6">
          <p className="text-sm text-red-400">{loadError}</p>
        </Card>
      ) : visibleAudits.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-slate-400">
            {searchTerm ? "Aramayla eşleşen denetim bulunamadı." : "Henüz denetim eklenmedi."}
          </p>
        </Card>
      ) : view === "card" ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedAudits.map((audit) => (
              <AuditCard key={audit.id} audit={audit} />
            ))}
          </div>
          <div className="mt-4">
            <Card>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableHeaderCell
                    key={column.key}
                    onClick={() => toggleSort(column.key)}
                    className="cursor-pointer select-none hover:text-slate-200"
                  >
                    <span className="inline-flex items-center gap-1">
                      {column.label}
                      {sortKey === column.key ? (
                        sortDirection === "asc" ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        )
                      ) : (
                        <ArrowUpDown size={12} className="text-slate-600" />
                      )}
                    </span>
                  </TableHeaderCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedAudits.map((audit) => (
                <TableRow
                  key={audit.id}
                  onClick={() => navigate(`/audits/${audit.id}`)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium text-white">{audit.siteName}</TableCell>
                  <TableCell>{audit.inspectorName}</TableCell>
                  <TableCell>{audit.auditDate}</TableCell>
                  <TableCell>{audit.type}</TableCell>
                  <TableCell>
                    <Badge>{audit.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </Card>
      )}

      {isModalOpen && (
        <Modal title="Yeni Denetim Ekle" onClose={() => setIsModalOpen(false)}>
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
              Denetçi
              <select
                value={form.inspectorId}
                onChange={(e) => setForm({ ...form, inspectorId: Number(e.target.value) })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              >
                {personnel.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.fullName}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Tarih
              <input
                required
                type="date"
                value={form.auditDate}
                onChange={(e) => setForm({ ...form, auditDate: e.target.value })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Tip
              <input
                required
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
                placeholder="Örn. safety, quality, environmental"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Durum
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              >
                <option value="scheduled">scheduled</option>
                <option value="in_progress">in_progress</option>
                <option value="completed">completed</option>
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

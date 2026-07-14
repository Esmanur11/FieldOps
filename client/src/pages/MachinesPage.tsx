import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Layout } from "../components/Layout";
import { MachineCard } from "../components/MachineCard";
import { MachineTypeBadge } from "../components/MachineTypeBadge";
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
import { createMachine, getMachines, getSites } from "../lib/api";
import type { CreateMachineRequest, Machine } from "../types/machine";
import type { Site } from "../types/site";

const machineTypes = ["Ekskavatör", "Vinç", "Kamyon", "Beton Pompası", "Silindir", "Diğer"];

const PAGE_SIZE = 10;

function emptyForm(defaultSiteId: number): CreateMachineRequest {
  return {
    siteId: defaultSiteId,
    name: "",
    type: machineTypes[0],
    serialNumber: "",
    purchaseDate: "",
    status: "active",
  };
}

type SortKey = "name" | "type" | "site" | "status";
type SortDirection = "asc" | "desc";

const columns: { key: SortKey; label: string }[] = [
  { key: "name", label: "İsim" },
  { key: "type", label: "Tip" },
  { key: "site", label: "Şantiye" },
  { key: "status", label: "Durum" },
];

export function MachinesPage() {
  const navigate = useNavigate();

  const [machines, setMachines] = useState<Machine[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState<ViewMode>("card");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<CreateMachineRequest>(emptyForm(0));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [machinesData, sitesData] = await Promise.all([getMachines(), getSites()]);
      setMachines(machinesData);
      setSites(sitesData);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  }

  const siteNameById = useMemo(() => {
    const map = new Map<number, string>();
    sites.forEach((site) => map.set(site.id, site.name));
    return map;
  }, [sites]);

  function openModal() {
    setForm(emptyForm(sites[0]?.id ?? 0));
    setFormError(null);
    setIsModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      await createMachine(form);
      setIsModalOpen(false);
      await loadData();
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

  const visibleMachines = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = term
      ? machines.filter(
          (machine) =>
            machine.name.toLowerCase().includes(term) ||
            (siteNameById.get(machine.siteId) ?? "").toLowerCase().includes(term),
        )
      : machines;

    const valueFor = (machine: Machine) =>
      sortKey === "site" ? (siteNameById.get(machine.siteId) ?? "") : (machine[sortKey] ?? "");

    const sorted = [...filtered].sort((a, b) => {
      const aValue = valueFor(a).toString().toLowerCase();
      const bValue = valueFor(b).toString().toLowerCase();
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [machines, siteNameById, searchTerm, sortKey, sortDirection]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(visibleMachines.length / PAGE_SIZE));
  const paginatedMachines = visibleMachines.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <Layout
      title="FieldOps — Makine Yönetimi"
      actions={
        <Button onClick={openModal} disabled={sites.length === 0}>
          + Yeni Makine Ekle
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
            placeholder="İsim veya şantiyeye göre ara..."
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
      ) : visibleMachines.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-slate-400">
            {searchTerm ? "Aramayla eşleşen makine bulunamadı." : "Henüz makine eklenmedi."}
          </p>
        </Card>
      ) : view === "card" ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedMachines.map((machine) => (
              <MachineCard
                key={machine.id}
                machine={machine}
                siteName={siteNameById.get(machine.siteId) ?? "—"}
              />
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
              {paginatedMachines.map((machine) => (
                <TableRow
                  key={machine.id}
                  onClick={() => navigate(`/machines/${machine.id}`)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium text-white">{machine.name}</TableCell>
                  <TableCell>
                    <MachineTypeBadge type={machine.type} />
                  </TableCell>
                  <TableCell>{siteNameById.get(machine.siteId) ?? "—"}</TableCell>
                  <TableCell>
                    <Badge>{machine.status}</Badge>
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
        <Modal title="Yeni Makine Ekle" onClose={() => setIsModalOpen(false)}>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              İsim
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
                placeholder="Örn. Ekskavatör-01"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Tip
              <select
                required
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              >
                {machineTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Şantiye
              <select
                required
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
              Seri No <span className="text-slate-500">(opsiyonel)</span>
              <input
                value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
                placeholder="Örn. SN-778812"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Satın Alma Tarihi <span className="text-slate-500">(opsiyonel)</span>
              <input
                type="date"
                value={form.purchaseDate}
                onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Durum
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
                <option value="maintenance">maintenance</option>
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

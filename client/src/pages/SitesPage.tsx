import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
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
import { createSite, getSites } from "../lib/api";
import type { CreateSiteRequest, Site } from "../types/site";

const emptyForm: CreateSiteRequest = {
  name: "",
  location: "",
  startDate: "",
  status: "active",
};

const PAGE_SIZE = 10;

type SortKey = "name" | "location" | "startDate" | "status";
type SortDirection = "asc" | "desc";

const columns: { key: SortKey; label: string }[] = [
  { key: "name", label: "İsim" },
  { key: "location", label: "Lokasyon" },
  { key: "startDate", label: "Başlangıç Tarihi" },
  { key: "status", label: "Durum" },
];

export function SitesPage() {
  const navigate = useNavigate();

  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<CreateSiteRequest>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadSites();
  }, []);

  async function loadSites() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getSites();
      setSites(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  }

  function openModal() {
    setForm(emptyForm);
    setFormError(null);
    setIsModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      await createSite(form);
      setIsModalOpen(false);
      await loadSites();
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

  const visibleSites = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = term
      ? sites.filter(
          (site) =>
            site.name.toLowerCase().includes(term) ||
            (site.location ?? "").toLowerCase().includes(term),
        )
      : sites;

    const sorted = [...filtered].sort((a, b) => {
      const aValue = (a[sortKey] ?? "").toString().toLowerCase();
      const bValue = (b[sortKey] ?? "").toString().toLowerCase();
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [sites, searchTerm, sortKey, sortDirection]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(visibleSites.length / PAGE_SIZE));
  const paginatedSites = visibleSites.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <Layout
      title="FieldOps — Şantiye Operasyon Yönetimi"
      actions={<Button onClick={openModal}>+ Yeni Şantiye Ekle</Button>}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="İsim veya lokasyona göre ara..."
            className="w-full rounded-lg border border-navy-600 bg-navy-800 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-brand-500"
          />
        </div>
      </div>

      <Card>
        {isLoading ? (
          <p className="p-6 text-sm text-slate-400">Yükleniyor...</p>
        ) : loadError ? (
          <p className="p-6 text-sm text-red-400">{loadError}</p>
        ) : visibleSites.length === 0 ? (
          <p className="p-6 text-sm text-slate-400">
            {searchTerm ? "Aramayla eşleşen şantiye bulunamadı." : "Henüz şantiye eklenmedi."}
          </p>
        ) : (
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
              {paginatedSites.map((site) => (
                <TableRow
                  key={site.id}
                  onClick={() => navigate(`/sites/${site.id}`)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium text-white">{site.name}</TableCell>
                  <TableCell>{site.location ?? "—"}</TableCell>
                  <TableCell>{site.startDate}</TableCell>
                  <TableCell>
                    <Badge>{site.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </Card>

      {isModalOpen && (
        <Modal title="Yeni Şantiye Ekle" onClose={() => setIsModalOpen(false)}>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              İsim
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
                placeholder="Örn. İzmir Havalimanı Projesi"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Lokasyon
              <input
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
                placeholder="Örn. Gaziemir, İzmir"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Başlangıç Tarihi
              <input
                required
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
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
                <option value="on_hold">on_hold</option>
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

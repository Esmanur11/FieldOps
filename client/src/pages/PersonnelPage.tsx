import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Layout } from "../components/Layout";
import { Modal } from "../components/Modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../components/Table";
import { createPersonnel, getPersonnel, getSites } from "../lib/api";
import type { CreatePersonnelRequest, Personnel } from "../types/personnel";
import type { Site } from "../types/site";

function emptyForm(defaultSiteId: number): CreatePersonnelRequest {
  return {
    siteId: defaultSiteId,
    fullName: "",
    role: "",
    phone: "",
    hireDate: "",
    status: "active",
  };
}

type SortKey = "fullName" | "role" | "site" | "hireDate" | "status";
type SortDirection = "asc" | "desc";

const columns: { key: SortKey; label: string }[] = [
  { key: "fullName", label: "İsim" },
  { key: "role", label: "Rol" },
  { key: "site", label: "Şantiye" },
  { key: "hireDate", label: "İşe Başlama Tarihi" },
  { key: "status", label: "Durum" },
];

export function PersonnelPage() {
  const navigate = useNavigate();

  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("fullName");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<CreatePersonnelRequest>(emptyForm(0));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [personnelData, sitesData] = await Promise.all([getPersonnel(), getSites()]);
      setPersonnel(personnelData);
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
      await createPersonnel(form);
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

  const visiblePersonnel = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = term
      ? personnel.filter(
          (person) =>
            person.fullName.toLowerCase().includes(term) ||
            (siteNameById.get(person.siteId) ?? "").toLowerCase().includes(term),
        )
      : personnel;

    const valueFor = (person: Personnel) =>
      sortKey === "site" ? (siteNameById.get(person.siteId) ?? "") : (person[sortKey] ?? "");

    const sorted = [...filtered].sort((a, b) => {
      const aValue = valueFor(a).toString().toLowerCase();
      const bValue = valueFor(b).toString().toLowerCase();
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [personnel, siteNameById, searchTerm, sortKey, sortDirection]);

  return (
    <Layout
      title="FieldOps — Personel Yönetimi"
      actions={
        <Button onClick={openModal} disabled={sites.length === 0}>
          + Yeni Personel Ekle
        </Button>
      }
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
            placeholder="İsim veya şantiyeye göre ara..."
            className="w-full rounded-lg border border-navy-600 bg-navy-800 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-brand-500"
          />
        </div>
      </div>

      <Card>
        {isLoading ? (
          <p className="p-6 text-sm text-slate-400">Yükleniyor...</p>
        ) : loadError ? (
          <p className="p-6 text-sm text-red-400">{loadError}</p>
        ) : visiblePersonnel.length === 0 ? (
          <p className="p-6 text-sm text-slate-400">
            {searchTerm ? "Aramayla eşleşen personel bulunamadı." : "Henüz personel eklenmedi."}
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
              {visiblePersonnel.map((person) => (
                <TableRow
                  key={person.id}
                  onClick={() => navigate(`/personnel/${person.id}`)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium text-white">{person.fullName}</TableCell>
                  <TableCell>{person.role}</TableCell>
                  <TableCell>{siteNameById.get(person.siteId) ?? "—"}</TableCell>
                  <TableCell>{person.hireDate}</TableCell>
                  <TableCell>
                    <Badge>{person.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {isModalOpen && (
        <Modal title="Yeni Personel Ekle" onClose={() => setIsModalOpen(false)}>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              İsim Soyisim
              <input
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
                placeholder="Örn. Ahmet Yılmaz"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Rol
              <input
                required
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
                placeholder="Örn. Saha Şefi"
              />
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
              Telefon
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
                placeholder="Örn. 0555 111 22 33"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              İşe Başlama Tarihi
              <input
                required
                type="date"
                value={form.hireDate}
                onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
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

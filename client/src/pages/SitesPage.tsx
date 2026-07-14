import { useEffect, useState, type FormEvent } from "react";
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
import { createSite, getSites } from "../lib/api";
import type { CreateSiteRequest, Site } from "../types/site";

const emptyForm: CreateSiteRequest = {
  name: "",
  location: "",
  startDate: "",
  status: "active",
};

export function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  return (
    <Layout
      title="FieldOps — Şantiye Operasyon Yönetimi"
      actions={<Button onClick={openModal}>+ Yeni Şantiye Ekle</Button>}
    >
      <Card>
        {isLoading ? (
          <p className="p-6 text-sm text-slate-400">Yükleniyor...</p>
        ) : loadError ? (
          <p className="p-6 text-sm text-red-400">{loadError}</p>
        ) : sites.length === 0 ? (
          <p className="p-6 text-sm text-slate-400">Henüz şantiye eklenmedi.</p>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>İsim</TableHeaderCell>
                <TableHeaderCell>Lokasyon</TableHeaderCell>
                <TableHeaderCell>Başlangıç Tarihi</TableHeaderCell>
                <TableHeaderCell>Durum</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sites.map((site) => (
                <TableRow key={site.id}>
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

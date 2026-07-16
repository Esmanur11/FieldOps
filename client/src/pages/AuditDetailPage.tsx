import { ArrowLeft } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
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
import { createAuditFinding, getAuditById, updateAuditFinding } from "../lib/api";
import { getSeverityBadgeClasses } from "../lib/severityColor";
import type { AuditDetail, CreateAuditFindingRequest } from "../types/audit";

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

const emptyFindingForm: Omit<CreateAuditFindingRequest, "auditId"> = {
  category: "",
  severity: "low",
  description: "",
  correctiveAction: "",
  dueDate: "",
};

const statusOptions = ["open", "in_progress", "resolved", "closed"];

export function AuditDetailPage() {
  const { id } = useParams<{ id: string }>();
  const auditId = Number(id);

  const [audit, setAudit] = useState<AuditDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isFindingModalOpen, setIsFindingModalOpen] = useState(false);
  const [findingForm, setFindingForm] = useState(emptyFindingForm);
  const [isFindingSubmitting, setIsFindingSubmitting] = useState(false);
  const [findingFormError, setFindingFormError] = useState<string | null>(null);

  const [updatingFindingId, setUpdatingFindingId] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    loadAudit();
  }, [id]);

  async function loadAudit() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getAuditById(auditId);
      setAudit(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  }

  function openFindingModal() {
    setFindingForm(emptyFindingForm);
    setFindingFormError(null);
    setIsFindingModalOpen(true);
  }

  async function handleFindingSubmit(event: FormEvent) {
    event.preventDefault();
    setIsFindingSubmitting(true);
    setFindingFormError(null);
    try {
      await createAuditFinding({ ...findingForm, auditId });
      setIsFindingModalOpen(false);
      await loadAudit();
    } catch (err) {
      setFindingFormError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu");
    } finally {
      setIsFindingSubmitting(false);
    }
  }

  async function handleStatusChange(findingId: number, status: string) {
    if (!audit) return;
    const finding = audit.findings.find((f) => f.id === findingId);
    if (!finding) return;

    setUpdatingFindingId(findingId);
    try {
      await updateAuditFinding(findingId, {
        category: finding.category ?? "",
        severity: finding.severity,
        description: finding.description,
        correctiveAction: finding.correctiveAction ?? "",
        dueDate: finding.dueDate ?? "",
        status,
      });
      await loadAudit();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Bulgu güncellenemedi");
    } finally {
      setUpdatingFindingId(null);
    }
  }

  return (
    <Layout title="Denetim Detayı">
      <Link
        to="/audits"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white"
      >
        <ArrowLeft size={16} />
        Denetimlere dön
      </Link>

      {isLoading ? (
        <p className="text-sm text-slate-400">Yükleniyor...</p>
      ) : loadError ? (
        <p className="text-sm text-red-400">{loadError}</p>
      ) : audit ? (
        <div className="flex flex-col gap-6">
          <Card className="max-w-xl p-6">
            <h2 className="text-xl font-semibold text-white">{audit.type}</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <DetailField label="Şantiye">{audit.siteName}</DetailField>
              <DetailField label="Denetçi">{audit.inspectorName}</DetailField>
              <DetailField label="Tarih">{audit.auditDate}</DetailField>
              <DetailField label="Durum">
                <Badge>{audit.status}</Badge>
              </DetailField>
              <DetailField label="Denetim ID">#{audit.id}</DetailField>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Bulgular</h3>
            <Button variant="secondary" onClick={openFindingModal}>
              + Bulgu Ekle
            </Button>
          </div>
          {audit.findings.length === 0 ? (
            <Card className="p-6">
              <p className="text-sm text-slate-400">Henüz bulgu eklenmedi.</p>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Kategori</TableHeaderCell>
                    <TableHeaderCell>Önem Derecesi</TableHeaderCell>
                    <TableHeaderCell>Açıklama</TableHeaderCell>
                    <TableHeaderCell>Düzeltici Faaliyet</TableHeaderCell>
                    <TableHeaderCell>Son Tarih</TableHeaderCell>
                    <TableHeaderCell>Durum</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {audit.findings.map((finding) => (
                    <TableRow key={finding.id}>
                      <TableCell>{finding.category ?? "—"}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${getSeverityBadgeClasses(finding.severity)}`}
                        >
                          {finding.severity}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs text-white">{finding.description}</TableCell>
                      <TableCell className="max-w-xs">{finding.correctiveAction ?? "—"}</TableCell>
                      <TableCell>{finding.dueDate ?? "—"}</TableCell>
                      <TableCell>
                        <select
                          value={finding.status}
                          disabled={updatingFindingId === finding.id}
                          onChange={(e) => handleStatusChange(finding.id, e.target.value)}
                          className="rounded-lg border border-navy-600 bg-navy-800 px-2 py-1 text-xs text-white outline-none focus:border-brand-500"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      ) : null}

      {isFindingModalOpen && (
        <Modal title="Bulgu Ekle" onClose={() => setIsFindingModalOpen(false)}>
          <form className="flex flex-col gap-4" onSubmit={handleFindingSubmit}>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Kategori (opsiyonel)
              <input
                value={findingForm.category}
                onChange={(e) => setFindingForm({ ...findingForm, category: e.target.value })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
                placeholder="Örn. PPE, Electrical"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Önem Derecesi
              <select
                value={findingForm.severity}
                onChange={(e) => setFindingForm({ ...findingForm, severity: e.target.value })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
                <option value="critical">critical</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Açıklama
              <input
                required
                value={findingForm.description}
                onChange={(e) => setFindingForm({ ...findingForm, description: e.target.value })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Düzeltici Faaliyet (opsiyonel)
              <input
                value={findingForm.correctiveAction}
                onChange={(e) =>
                  setFindingForm({ ...findingForm, correctiveAction: e.target.value })
                }
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Son Tarih (opsiyonel)
              <input
                type="date"
                value={findingForm.dueDate}
                onChange={(e) => setFindingForm({ ...findingForm, dueDate: e.target.value })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              />
            </label>

            {findingFormError && <p className="text-sm text-red-400">{findingFormError}</p>}

            <div className="mt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsFindingModalOpen(false)}
                disabled={isFindingSubmitting}
              >
                Vazgeç
              </Button>
              <Button type="submit" disabled={isFindingSubmitting}>
                {isFindingSubmitting ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}

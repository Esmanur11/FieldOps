import { Clock } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
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
import {
  checkInShiftAssignment,
  checkOutShiftAssignment,
  createShift,
  createShiftAssignment,
  getPersonnel,
  getShiftAssignments,
  getShifts,
  getSites,
} from "../lib/api";
import type { CreateShiftAssignmentRequest, CreateShiftRequest, Shift, ShiftAssignment } from "../types/shift";
import type { Personnel } from "../types/personnel";
import type { Site } from "../types/site";

const emptyShiftForm: CreateShiftRequest = {
  siteId: 0,
  name: "",
  startTime: "08:00",
  endTime: "16:00",
};

const emptyAssignmentForm: CreateShiftAssignmentRequest = {
  shiftId: 0,
  personnelId: 0,
  workDate: "",
};

export function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [siteFilter, setSiteFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftForm, setShiftForm] = useState<CreateShiftRequest>(emptyShiftForm);
  const [isShiftSubmitting, setIsShiftSubmitting] = useState(false);
  const [shiftFormError, setShiftFormError] = useState<string | null>(null);

  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState<CreateShiftAssignmentRequest>(emptyAssignmentForm);
  const [isAssignmentSubmitting, setIsAssignmentSubmitting] = useState(false);
  const [assignmentFormError, setAssignmentFormError] = useState<string | null>(null);

  const [updatingAssignmentId, setUpdatingAssignmentId] = useState<number | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    loadAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteFilter, dateFilter]);

  async function loadAll() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [shiftsData, sitesData, personnelData] = await Promise.all([
        getShifts(),
        getSites(),
        getPersonnel(),
      ]);
      setShifts(shiftsData);
      setSites(sitesData);
      setPersonnel(personnelData);
      await loadAssignments();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadAssignments() {
    try {
      const data = await getShiftAssignments({
        siteId: siteFilter ? Number(siteFilter) : undefined,
        date: dateFilter || undefined,
      });
      setAssignments(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu");
    }
  }

  function openShiftModal() {
    setShiftForm({ ...emptyShiftForm, siteId: sites[0]?.id ?? 0 });
    setShiftFormError(null);
    setIsShiftModalOpen(true);
  }

  async function handleShiftSubmit(event: FormEvent) {
    event.preventDefault();
    setIsShiftSubmitting(true);
    setShiftFormError(null);
    try {
      await createShift(shiftForm);
      setIsShiftModalOpen(false);
      await loadAll();
    } catch (err) {
      setShiftFormError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu");
    } finally {
      setIsShiftSubmitting(false);
    }
  }

  function openAssignmentModal() {
    setAssignmentForm({
      ...emptyAssignmentForm,
      shiftId: shifts[0]?.id ?? 0,
      personnelId: personnel[0]?.id ?? 0,
    });
    setAssignmentFormError(null);
    setIsAssignmentModalOpen(true);
  }

  async function handleAssignmentSubmit(event: FormEvent) {
    event.preventDefault();
    setIsAssignmentSubmitting(true);
    setAssignmentFormError(null);
    try {
      await createShiftAssignment(assignmentForm);
      setIsAssignmentModalOpen(false);
      await loadAssignments();
    } catch (err) {
      setAssignmentFormError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu");
    } finally {
      setIsAssignmentSubmitting(false);
    }
  }

  async function handleCheckIn(id: number) {
    setUpdatingAssignmentId(id);
    try {
      await checkInShiftAssignment(id);
      await loadAssignments();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Check-in yapılamadı");
    } finally {
      setUpdatingAssignmentId(null);
    }
  }

  async function handleCheckOut(id: number) {
    setUpdatingAssignmentId(id);
    try {
      await checkOutShiftAssignment(id);
      await loadAssignments();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Check-out yapılamadı");
    } finally {
      setUpdatingAssignmentId(null);
    }
  }

  const sortedAssignments = useMemo(
    () => [...assignments].sort((a, b) => b.workDate.localeCompare(a.workDate)),
    [assignments],
  );

  return (
    <Layout
      title="FieldOps — Vardiya Yönetimi"
      actions={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={openShiftModal} disabled={sites.length === 0}>
            + Yeni Vardiya Ekle
          </Button>
          <Button
            onClick={openAssignmentModal}
            disabled={shifts.length === 0 || personnel.length === 0}
          >
            + Yeni Atama
          </Button>
        </div>
      }
    >
      {loadError && <p className="mb-6 text-sm text-red-400">{loadError}</p>}

      <h2 className="mb-3 text-sm font-semibold text-white">Vardiya Şablonları</h2>
      {isLoading ? (
        <Card className="p-6">
          <p className="text-sm text-slate-400">Yükleniyor...</p>
        </Card>
      ) : shifts.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-slate-400">Henüz vardiya eklenmedi.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shifts.map((shift) => (
            <Card key={shift.id} className="p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                  <Clock size={20} />
                </span>
                <div>
                  <p className="font-medium text-white">{shift.name}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{shift.siteName}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {shift.startTime.slice(0, 5)} – {shift.endTime.slice(0, 5)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mb-3 mt-8 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-white">Vardiya Atamaları</h2>
        <div className="flex gap-2">
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
          >
            <option value="">Tüm Şantiyeler</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {sortedAssignments.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-slate-400">
            {siteFilter || dateFilter ? "Filtreyle eşleşen atama bulunamadı." : "Henüz atama yapılmadı."}
          </p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Personel</TableHeaderCell>
                <TableHeaderCell>Vardiya</TableHeaderCell>
                <TableHeaderCell>Tarih</TableHeaderCell>
                <TableHeaderCell>Durum</TableHeaderCell>
                <TableHeaderCell>Check-in</TableHeaderCell>
                <TableHeaderCell>Check-out</TableHeaderCell>
                <TableHeaderCell>Aksiyon</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedAssignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium text-white">{assignment.personnelName}</TableCell>
                  <TableCell>
                    {assignment.shiftName} ({assignment.siteName})
                  </TableCell>
                  <TableCell>{assignment.workDate}</TableCell>
                  <TableCell>
                    <Badge>{assignment.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {assignment.checkIn ? new Date(assignment.checkIn).toLocaleTimeString("tr-TR") : "—"}
                  </TableCell>
                  <TableCell>
                    {assignment.checkOut ? new Date(assignment.checkOut).toLocaleTimeString("tr-TR") : "—"}
                  </TableCell>
                  <TableCell>
                    {!assignment.checkIn ? (
                      <Button
                        variant="secondary"
                        disabled={updatingAssignmentId === assignment.id}
                        onClick={() => handleCheckIn(assignment.id)}
                      >
                        Check-in Yap
                      </Button>
                    ) : !assignment.checkOut ? (
                      <Button
                        variant="secondary"
                        disabled={updatingAssignmentId === assignment.id}
                        onClick={() => handleCheckOut(assignment.id)}
                      >
                        Check-out Yap
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-500">Tamamlandı</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {isShiftModalOpen && (
        <Modal title="Yeni Vardiya Ekle" onClose={() => setIsShiftModalOpen(false)}>
          <form className="flex flex-col gap-4" onSubmit={handleShiftSubmit}>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Şantiye
              <select
                value={shiftForm.siteId}
                onChange={(e) => setShiftForm({ ...shiftForm, siteId: Number(e.target.value) })}
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
              İsim
              <input
                required
                value={shiftForm.name}
                onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
                placeholder="Örn. Gündüz, Gece"
              />
            </label>

            <div className="flex gap-4">
              <label className="flex flex-1 flex-col gap-1 text-sm text-slate-300">
                Başlangıç Saati
                <input
                  required
                  type="time"
                  value={shiftForm.startTime}
                  onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                  className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
                />
              </label>

              <label className="flex flex-1 flex-col gap-1 text-sm text-slate-300">
                Bitiş Saati
                <input
                  required
                  type="time"
                  value={shiftForm.endTime}
                  onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                  className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
                />
              </label>
            </div>

            {shiftFormError && <p className="text-sm text-red-400">{shiftFormError}</p>}

            <div className="mt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsShiftModalOpen(false)}
                disabled={isShiftSubmitting}
              >
                Vazgeç
              </Button>
              <Button type="submit" disabled={isShiftSubmitting}>
                {isShiftSubmitting ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {isAssignmentModalOpen && (
        <Modal title="Yeni Atama" onClose={() => setIsAssignmentModalOpen(false)}>
          <form className="flex flex-col gap-4" onSubmit={handleAssignmentSubmit}>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Vardiya
              <select
                value={assignmentForm.shiftId}
                onChange={(e) =>
                  setAssignmentForm({ ...assignmentForm, shiftId: Number(e.target.value) })
                }
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              >
                {shifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name} ({shift.siteName})
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Personel
              <select
                value={assignmentForm.personnelId}
                onChange={(e) =>
                  setAssignmentForm({ ...assignmentForm, personnelId: Number(e.target.value) })
                }
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
                value={assignmentForm.workDate}
                onChange={(e) =>
                  setAssignmentForm({ ...assignmentForm, workDate: e.target.value })
                }
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              />
            </label>

            {assignmentFormError && <p className="text-sm text-red-400">{assignmentFormError}</p>}

            <div className="mt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAssignmentModalOpen(false)}
                disabled={isAssignmentSubmitting}
              >
                Vazgeç
              </Button>
              <Button type="submit" disabled={isAssignmentSubmitting}>
                {isAssignmentSubmitting ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}

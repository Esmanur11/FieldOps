import { ArrowLeft } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Layout } from "../components/Layout";
import { Modal } from "../components/Modal";
import { RiskGauge } from "../components/RiskGauge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../components/Table";
import {
  createMachineUsageLog,
  createMaintenanceRecord,
  getMachineById,
  getMachineUsageLogs,
  getMaintenancePredictions,
  getMaintenanceRecords,
  getPersonnel,
  getSiteById,
  recalculateMaintenancePrediction,
} from "../lib/api";
import type { Machine } from "../types/machine";
import type {
  CreateMachineUsageLogRequest,
  CreateMaintenanceRecordRequest,
  MachineUsageLog,
  MaintenancePrediction,
  MaintenanceRecord,
} from "../types/maintenance";
import type { Personnel } from "../types/personnel";

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

const emptyUsageLogForm: CreateMachineUsageLogRequest = {
  machineId: 0,
  logDate: "",
  hoursUsed: 0,
  fuelConsumed: null,
  operatorId: 0,
};

const emptyMaintenanceForm: CreateMaintenanceRecordRequest = {
  machineId: 0,
  maintenanceDate: "",
  type: "",
  description: "",
  cost: null,
  performedBy: "",
};

export function MachineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const machineId = Number(id);

  const [machine, setMachine] = useState<Machine | null>(null);
  const [siteName, setSiteName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [usageLogs, setUsageLogs] = useState<MachineUsageLog[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [prediction, setPrediction] = useState<MaintenancePrediction | null>(null);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);

  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [usageForm, setUsageForm] = useState<CreateMachineUsageLogRequest>(emptyUsageLogForm);
  const [isUsageSubmitting, setIsUsageSubmitting] = useState(false);
  const [usageFormError, setUsageFormError] = useState<string | null>(null);

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [maintenanceForm, setMaintenanceForm] =
    useState<CreateMaintenanceRecordRequest>(emptyMaintenanceForm);
  const [isMaintenanceSubmitting, setIsMaintenanceSubmitting] = useState(false);
  const [maintenanceFormError, setMaintenanceFormError] = useState<string | null>(null);

  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalculateError, setRecalculateError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    loadMachine();
    loadMaintenanceData();
    getPersonnel().then(setPersonnel).catch(() => setPersonnel([]));
  }, [id]);

  async function loadMachine() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getMachineById(machineId);
      setMachine(data);
      const site = await getSiteById(data.siteId).catch(() => null);
      setSiteName(site?.name ?? null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadMaintenanceData() {
    try {
      const [logs, records, predictions] = await Promise.all([
        getMachineUsageLogs(machineId),
        getMaintenanceRecords(machineId),
        getMaintenancePredictions(machineId),
      ]);
      setUsageLogs(logs);
      setMaintenanceRecords(records);
      setPrediction(predictions[0] ?? null);
    } catch {
      // Bakım verileri opsiyonel bölümler; ana makine bilgisi hâlâ görüntülenebilir.
    }
  }

  function openUsageModal() {
    setUsageForm({ ...emptyUsageLogForm, machineId, operatorId: personnel[0]?.id ?? 0 });
    setUsageFormError(null);
    setIsUsageModalOpen(true);
  }

  async function handleUsageSubmit(event: FormEvent) {
    event.preventDefault();
    setIsUsageSubmitting(true);
    setUsageFormError(null);
    try {
      await createMachineUsageLog(usageForm);
      setIsUsageModalOpen(false);
      await loadMaintenanceData();
    } catch (err) {
      setUsageFormError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu");
    } finally {
      setIsUsageSubmitting(false);
    }
  }

  function openMaintenanceModal() {
    setMaintenanceForm({ ...emptyMaintenanceForm, machineId });
    setMaintenanceFormError(null);
    setIsMaintenanceModalOpen(true);
  }

  async function handleMaintenanceSubmit(event: FormEvent) {
    event.preventDefault();
    setIsMaintenanceSubmitting(true);
    setMaintenanceFormError(null);
    try {
      await createMaintenanceRecord(maintenanceForm);
      setIsMaintenanceModalOpen(false);
      await loadMaintenanceData();
    } catch (err) {
      setMaintenanceFormError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu");
    } finally {
      setIsMaintenanceSubmitting(false);
    }
  }

  async function handleRecalculate() {
    setIsRecalculating(true);
    setRecalculateError(null);
    try {
      const result = await recalculateMaintenancePrediction(machineId);
      setPrediction(result);
    } catch (err) {
      setRecalculateError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu");
    } finally {
      setIsRecalculating(false);
    }
  }

  return (
    <Layout title="Makine Detayı">
      <Link
        to="/machines"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white"
      >
        <ArrowLeft size={16} />
        Makinelere dön
      </Link>

      {isLoading ? (
        <p className="text-sm text-slate-400">Yükleniyor...</p>
      ) : loadError ? (
        <p className="text-sm text-red-400">{loadError}</p>
      ) : machine ? (
        <div className="flex flex-col gap-6">
          <Card className="max-w-xl p-6">
            <h2 className="text-xl font-semibold text-white">{machine.name}</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <DetailField label="Tip">{machine.type}</DetailField>
              <DetailField label="Şantiye">{siteName ?? `#${machine.siteId}`}</DetailField>
              <DetailField label="Seri No">{machine.serialNumber ?? "—"}</DetailField>
              <DetailField label="Satın Alma Tarihi">{machine.purchaseDate ?? "—"}</DetailField>
              <DetailField label="Durum">
                <Badge>{machine.status}</Badge>
              </DetailField>
              <DetailField label="Makine ID">#{machine.id}</DetailField>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Kullanım Kayıtları</h3>
            <Button variant="secondary" onClick={openUsageModal} disabled={personnel.length === 0}>
              + Kayıt Ekle
            </Button>
          </div>
          {usageLogs.length === 0 ? (
            <Card className="p-6">
              <p className="text-sm text-slate-400">Henüz kullanım kaydı eklenmedi.</p>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Tarih</TableHeaderCell>
                    <TableHeaderCell>Saat</TableHeaderCell>
                    <TableHeaderCell>Yakıt</TableHeaderCell>
                    <TableHeaderCell>Operatör</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usageLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.logDate}</TableCell>
                      <TableCell className="text-white">{log.hoursUsed} saat</TableCell>
                      <TableCell>{log.fuelConsumed ?? "—"}</TableCell>
                      <TableCell>
                        {personnel.find((p) => p.id === log.operatorId)?.fullName ?? `#${log.operatorId}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Bakım Geçmişi</h3>
            <Button variant="secondary" onClick={openMaintenanceModal}>
              + Bakım Ekle
            </Button>
          </div>
          {maintenanceRecords.length === 0 ? (
            <Card className="p-6">
              <p className="text-sm text-slate-400">Henüz bakım kaydı eklenmedi.</p>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Tarih</TableHeaderCell>
                    <TableHeaderCell>Tip</TableHeaderCell>
                    <TableHeaderCell>Açıklama</TableHeaderCell>
                    <TableHeaderCell>Maliyet</TableHeaderCell>
                    <TableHeaderCell>Yapan</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {maintenanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.maintenanceDate}</TableCell>
                      <TableCell className="text-white">{record.type}</TableCell>
                      <TableCell>{record.description ?? "—"}</TableCell>
                      <TableCell>{record.cost ?? "—"}</TableCell>
                      <TableCell>{record.performedBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Bakım Tahmini</h3>
            <Button onClick={handleRecalculate} disabled={isRecalculating}>
              {isRecalculating ? "Hesaplanıyor..." : "Şimdi Yeniden Hesapla"}
            </Button>
          </div>
          {recalculateError && <p className="text-sm text-red-400">{recalculateError}</p>}
          <Card className="p-6">
            {prediction ? (
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <RiskGauge riskScore={prediction.riskScore} />
                <div>
                  <p className="text-sm text-slate-400">
                    Tahmini bakım tarihi:{" "}
                    <span className="font-medium text-white">{prediction.predictedDate}</span>
                  </p>
                  {prediction.basis && (
                    <p className="mt-2 max-w-lg text-xs text-slate-500">{prediction.basis}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                Henüz bir bakım tahmini hesaplanmadı. "Şimdi Yeniden Hesapla" butonuna tıklayın.
              </p>
            )}
          </Card>
        </div>
      ) : null}

      {isUsageModalOpen && (
        <Modal title="Kullanım Kaydı Ekle" onClose={() => setIsUsageModalOpen(false)}>
          <form className="flex flex-col gap-4" onSubmit={handleUsageSubmit}>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Tarih
              <input
                required
                type="date"
                value={usageForm.logDate}
                onChange={(e) => setUsageForm({ ...usageForm, logDate: e.target.value })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Saat
              <input
                required
                type="number"
                step="0.1"
                min="0.1"
                value={usageForm.hoursUsed || ""}
                onChange={(e) => setUsageForm({ ...usageForm, hoursUsed: Number(e.target.value) })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Yakıt (opsiyonel)
              <input
                type="number"
                step="0.1"
                min="0"
                value={usageForm.fuelConsumed ?? ""}
                onChange={(e) =>
                  setUsageForm({
                    ...usageForm,
                    fuelConsumed: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Operatör
              <select
                value={usageForm.operatorId}
                onChange={(e) => setUsageForm({ ...usageForm, operatorId: Number(e.target.value) })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              >
                {personnel.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.fullName}
                  </option>
                ))}
              </select>
            </label>

            {usageFormError && <p className="text-sm text-red-400">{usageFormError}</p>}

            <div className="mt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsUsageModalOpen(false)}
                disabled={isUsageSubmitting}
              >
                Vazgeç
              </Button>
              <Button type="submit" disabled={isUsageSubmitting}>
                {isUsageSubmitting ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {isMaintenanceModalOpen && (
        <Modal title="Bakım Kaydı Ekle" onClose={() => setIsMaintenanceModalOpen(false)}>
          <form className="flex flex-col gap-4" onSubmit={handleMaintenanceSubmit}>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Tarih
              <input
                required
                type="date"
                value={maintenanceForm.maintenanceDate}
                onChange={(e) =>
                  setMaintenanceForm({ ...maintenanceForm, maintenanceDate: e.target.value })
                }
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Tip
              <input
                required
                value={maintenanceForm.type}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, type: e.target.value })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
                placeholder="Örn. routine, repair"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Açıklama (opsiyonel)
              <input
                value={maintenanceForm.description}
                onChange={(e) =>
                  setMaintenanceForm({ ...maintenanceForm, description: e.target.value })
                }
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Maliyet (opsiyonel)
              <input
                type="number"
                step="0.01"
                min="0"
                value={maintenanceForm.cost ?? ""}
                onChange={(e) =>
                  setMaintenanceForm({
                    ...maintenanceForm,
                    cost: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Yapan
              <input
                required
                value={maintenanceForm.performedBy}
                onChange={(e) =>
                  setMaintenanceForm({ ...maintenanceForm, performedBy: e.target.value })
                }
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
                placeholder="Örn. Ahmet Yılmaz"
              />
            </label>

            {maintenanceFormError && <p className="text-sm text-red-400">{maintenanceFormError}</p>}

            <div className="mt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsMaintenanceModalOpen(false)}
                disabled={isMaintenanceSubmitting}
              >
                Vazgeç
              </Button>
              <Button type="submit" disabled={isMaintenanceSubmitting}>
                {isMaintenanceSubmitting ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}

import { Package } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
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
  createMaterial,
  createMaterialTransaction,
  getMaterials,
  getMaterialStocks,
  getPersonnel,
  getSites,
} from "../lib/api";
import type { CreateMaterialRequest, CreateMaterialTransactionRequest, Material, MaterialStock } from "../types/material";
import type { Personnel } from "../types/personnel";
import type { Site } from "../types/site";

const emptyMaterialForm: CreateMaterialRequest = {
  name: "",
  unit: "",
  unitCost: null,
};

const emptyTransactionForm: CreateMaterialTransactionRequest = {
  siteId: 0,
  materialId: 0,
  transactionType: "in",
  quantity: 0,
  performedBy: 0,
};

export function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [stocks, setStocks] = useState<MaterialStock[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [materialForm, setMaterialForm] = useState<CreateMaterialRequest>(emptyMaterialForm);
  const [isMaterialSubmitting, setIsMaterialSubmitting] = useState(false);
  const [materialFormError, setMaterialFormError] = useState<string | null>(null);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionForm, setTransactionForm] =
    useState<CreateMaterialTransactionRequest>(emptyTransactionForm);
  const [isTransactionSubmitting, setIsTransactionSubmitting] = useState(false);
  const [transactionFormError, setTransactionFormError] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [materialsData, stocksData, sitesData, personnelData] = await Promise.all([
        getMaterials(),
        getMaterialStocks(),
        getSites(),
        getPersonnel(),
      ]);
      setMaterials(materialsData);
      setStocks(stocksData);
      setSites(sitesData);
      setPersonnel(personnelData);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  }

  function openMaterialModal() {
    setMaterialForm(emptyMaterialForm);
    setMaterialFormError(null);
    setIsMaterialModalOpen(true);
  }

  async function handleMaterialSubmit(event: FormEvent) {
    event.preventDefault();
    setIsMaterialSubmitting(true);
    setMaterialFormError(null);
    try {
      await createMaterial(materialForm);
      setIsMaterialModalOpen(false);
      await loadAll();
    } catch (err) {
      setMaterialFormError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu");
    } finally {
      setIsMaterialSubmitting(false);
    }
  }

  function openTransactionModal() {
    setTransactionForm({
      ...emptyTransactionForm,
      siteId: sites[0]?.id ?? 0,
      materialId: materials[0]?.id ?? 0,
      performedBy: personnel[0]?.id ?? 0,
    });
    setTransactionFormError(null);
    setIsTransactionModalOpen(true);
  }

  async function handleTransactionSubmit(event: FormEvent) {
    event.preventDefault();
    setIsTransactionSubmitting(true);
    setTransactionFormError(null);
    try {
      await createMaterialTransaction(transactionForm);
      setIsTransactionModalOpen(false);
      await loadAll();
    } catch (err) {
      setTransactionFormError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu");
    } finally {
      setIsTransactionSubmitting(false);
    }
  }

  return (
    <Layout
      title="FieldOps — Malzeme ve Stok Yönetimi"
      actions={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={openMaterialModal}>
            + Yeni Malzeme Ekle
          </Button>
          <Button onClick={openTransactionModal} disabled={materials.length === 0 || sites.length === 0}>
            Stok Hareketi Ekle
          </Button>
        </div>
      }
    >
      {loadError && <p className="mb-6 text-sm text-red-400">{loadError}</p>}

      <h2 className="mb-3 text-sm font-semibold text-white">Malzeme Kataloğu</h2>
      {isLoading ? (
        <Card className="p-6">
          <p className="text-sm text-slate-400">Yükleniyor...</p>
        </Card>
      ) : materials.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-slate-400">Henüz malzeme eklenmedi.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => (
            <Card key={material.id} className="p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                  <Package size={20} />
                </span>
                <div>
                  <p className="font-medium text-white">{material.name}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Birim: {material.unit}
                    {material.unitCost !== null && ` · ${material.unitCost} ₺/birim`}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <h2 className="mb-3 mt-8 text-sm font-semibold text-white">Şantiye Bazlı Stok Durumu</h2>
      {isLoading ? (
        <Card className="p-6">
          <p className="text-sm text-slate-400">Yükleniyor...</p>
        </Card>
      ) : stocks.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-slate-400">Henüz stok hareketi kaydedilmedi.</p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Malzeme</TableHeaderCell>
                <TableHeaderCell>Şantiye</TableHeaderCell>
                <TableHeaderCell>Miktar</TableHeaderCell>
                <TableHeaderCell>Eşik</TableHeaderCell>
                <TableHeaderCell>Durum</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stocks.map((stock) => (
                <TableRow key={stock.id}>
                  <TableCell className="font-medium text-white">{stock.materialName}</TableCell>
                  <TableCell>{stock.siteName}</TableCell>
                  <TableCell>
                    {stock.quantity} {stock.unit}
                  </TableCell>
                  <TableCell>
                    {stock.reorderThreshold} {stock.unit}
                  </TableCell>
                  <TableCell>
                    {stock.isLowStock ? (
                      <span className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-400">
                        Düşük Stok
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                        Yeterli
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {isMaterialModalOpen && (
        <Modal title="Yeni Malzeme Ekle" onClose={() => setIsMaterialModalOpen(false)}>
          <form className="flex flex-col gap-4" onSubmit={handleMaterialSubmit}>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              İsim
              <input
                required
                value={materialForm.name}
                onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
                placeholder="Örn. Çimento"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Birim
              <input
                required
                value={materialForm.unit}
                onChange={(e) => setMaterialForm({ ...materialForm, unit: e.target.value })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
                placeholder="Örn. torba, kg, adet"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Birim Fiyat (opsiyonel)
              <input
                type="number"
                step="0.01"
                min="0"
                value={materialForm.unitCost ?? ""}
                onChange={(e) =>
                  setMaterialForm({
                    ...materialForm,
                    unitCost: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              />
            </label>

            {materialFormError && <p className="text-sm text-red-400">{materialFormError}</p>}

            <div className="mt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsMaterialModalOpen(false)}
                disabled={isMaterialSubmitting}
              >
                Vazgeç
              </Button>
              <Button type="submit" disabled={isMaterialSubmitting}>
                {isMaterialSubmitting ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {isTransactionModalOpen && (
        <Modal title="Stok Hareketi Ekle" onClose={() => setIsTransactionModalOpen(false)}>
          <form className="flex flex-col gap-4" onSubmit={handleTransactionSubmit}>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Şantiye
              <select
                value={transactionForm.siteId}
                onChange={(e) =>
                  setTransactionForm({ ...transactionForm, siteId: Number(e.target.value) })
                }
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
              Malzeme
              <select
                value={transactionForm.materialId}
                onChange={(e) =>
                  setTransactionForm({ ...transactionForm, materialId: Number(e.target.value) })
                }
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              >
                {materials.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Tip
              <select
                value={transactionForm.transactionType}
                onChange={(e) =>
                  setTransactionForm({ ...transactionForm, transactionType: e.target.value })
                }
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              >
                <option value="in">Giriş</option>
                <option value="out">Çıkış</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Miktar
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                value={transactionForm.quantity || ""}
                onChange={(e) =>
                  setTransactionForm({ ...transactionForm, quantity: Number(e.target.value) })
                }
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Personel
              <select
                value={transactionForm.performedBy}
                onChange={(e) =>
                  setTransactionForm({ ...transactionForm, performedBy: Number(e.target.value) })
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

            {transactionFormError && <p className="text-sm text-red-400">{transactionFormError}</p>}

            <div className="mt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsTransactionModalOpen(false)}
                disabled={isTransactionSubmitting}
              >
                Vazgeç
              </Button>
              <Button type="submit" disabled={isTransactionSubmitting}>
                {isTransactionSubmitting ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}
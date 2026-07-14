import { ArrowLeft } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../components/Badge";
import { Card } from "../components/Card";
import { Layout } from "../components/Layout";
import { getMachineById, getSiteById } from "../lib/api";
import type { Machine } from "../types/machine";

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

export function MachineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [siteName, setSiteName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setLoadError(null);

    getMachineById(Number(id))
      .then(async (data) => {
        setMachine(data);
        const site = await getSiteById(data.siteId).catch(() => null);
        setSiteName(site?.name ?? null);
      })
      .catch((err) =>
        setLoadError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu"),
      )
      .finally(() => setIsLoading(false));
  }, [id]);

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
      ) : null}
    </Layout>
  );
}

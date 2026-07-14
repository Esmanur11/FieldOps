import { ArrowLeft } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../components/Badge";
import { Card } from "../components/Card";
import { Layout } from "../components/Layout";
import { getPersonnelById, getSiteById } from "../lib/api";
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

export function PersonnelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [person, setPerson] = useState<Personnel | null>(null);
  const [siteName, setSiteName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setLoadError(null);

    getPersonnelById(Number(id))
      .then(async (data) => {
        setPerson(data);
        const site = await getSiteById(data.siteId).catch(() => null);
        setSiteName(site?.name ?? null);
      })
      .catch((err) =>
        setLoadError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu"),
      )
      .finally(() => setIsLoading(false));
  }, [id]);

  return (
    <Layout title="Personel Detayı">
      <Link
        to="/personnel"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white"
      >
        <ArrowLeft size={16} />
        Personele dön
      </Link>

      {isLoading ? (
        <p className="text-sm text-slate-400">Yükleniyor...</p>
      ) : loadError ? (
        <p className="text-sm text-red-400">{loadError}</p>
      ) : person ? (
        <Card className="max-w-xl p-6">
          <h2 className="text-xl font-semibold text-white">{person.fullName}</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <DetailField label="Rol">{person.role}</DetailField>
            <DetailField label="Şantiye">{siteName ?? `#${person.siteId}`}</DetailField>
            <DetailField label="Telefon">{person.phone ?? "—"}</DetailField>
            <DetailField label="İşe Başlama Tarihi">{person.hireDate}</DetailField>
            <DetailField label="Durum">
              <Badge>{person.status}</Badge>
            </DetailField>
            <DetailField label="Personel ID">#{person.id}</DetailField>
          </div>
        </Card>
      ) : null}
    </Layout>
  );
}

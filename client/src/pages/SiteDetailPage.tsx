import { ArrowLeft } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../components/Badge";
import { Card } from "../components/Card";
import { Layout } from "../components/Layout";
import { getSiteById } from "../lib/api";
import type { Site } from "../types/site";

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

export function SiteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setLoadError(null);
    getSiteById(Number(id))
      .then(setSite)
      .catch((err) =>
        setLoadError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu"),
      )
      .finally(() => setIsLoading(false));
  }, [id]);

  return (
    <Layout title="Şantiye Detayı">
      <Link
        to="/sites"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white"
      >
        <ArrowLeft size={16} />
        Şantiyelere dön
      </Link>

      {isLoading ? (
        <p className="text-sm text-slate-400">Yükleniyor...</p>
      ) : loadError ? (
        <p className="text-sm text-red-400">{loadError}</p>
      ) : site ? (
        <Card className="max-w-xl p-6">
          <h2 className="text-xl font-semibold text-white">{site.name}</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <DetailField label="Lokasyon">{site.location ?? "—"}</DetailField>
            <DetailField label="Başlangıç Tarihi">{site.startDate}</DetailField>
            <DetailField label="Durum">
              <Badge>{site.status}</Badge>
            </DetailField>
            <DetailField label="Şantiye ID">#{site.id}</DetailField>
          </div>
        </Card>
      ) : null}
    </Layout>
  );
}

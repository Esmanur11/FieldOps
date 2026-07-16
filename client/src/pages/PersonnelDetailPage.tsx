import { ArrowLeft } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../components/Badge";
import { Card } from "../components/Card";
import { Layout } from "../components/Layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../components/Table";
import { getPersonnelById, getShiftAssignments, getSiteById } from "../lib/api";
import type { Personnel } from "../types/personnel";
import type { ShiftAssignment } from "../types/shift";

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
  const [shiftAssignments, setShiftAssignments] = useState<ShiftAssignment[]>([]);
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

    getShiftAssignments({ personnelId: Number(id) })
      .then(setShiftAssignments)
      .catch(() => setShiftAssignments([]));
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
        <div className="flex flex-col gap-6">
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

          <h3 className="text-sm font-semibold text-white">Vardiya Atamaları</h3>
          {shiftAssignments.length === 0 ? (
            <Card className="p-6">
              <p className="text-sm text-slate-400">Bu personele henüz vardiya atanmadı.</p>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Vardiya</TableHeaderCell>
                    <TableHeaderCell>Tarih</TableHeaderCell>
                    <TableHeaderCell>Durum</TableHeaderCell>
                    <TableHeaderCell>Check-in</TableHeaderCell>
                    <TableHeaderCell>Check-out</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shiftAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="text-white">
                        {assignment.shiftName} ({assignment.siteName})
                      </TableCell>
                      <TableCell>{assignment.workDate}</TableCell>
                      <TableCell>
                        <Badge>{assignment.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {assignment.checkIn
                          ? new Date(assignment.checkIn).toLocaleTimeString("tr-TR")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {assignment.checkOut
                          ? new Date(assignment.checkOut).toLocaleTimeString("tr-TR")
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      ) : null}
    </Layout>
  );
}

import { AlertTriangle, RefreshCw, UserPlus } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
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
import { createUser, getPersonnelWithoutAccount, getUsers } from "../lib/api";
import { getAuth } from "../lib/auth";
import { generateStrongPassword, suggestUsername } from "../lib/userCredentials";
import type { Personnel } from "../types/personnel";
import type { CreateUserRequest, User } from "../types/user";

interface CreatedAccount {
  username: string;
  password: string;
}

export function UsersPage() {
  const auth = getAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [availablePersonnel, setAvailablePersonnel] = useState<Personnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const [form, setForm] = useState<Pick<CreateUserRequest, "username" | "password" | "role">>({
    username: "",
    password: "",
    role: "User",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdAccount, setCreatedAccount] = useState<CreatedAccount | null>(null);

  useEffect(() => {
    if (auth?.role === "Admin") {
      loadAll();
    }
  }, [auth?.role]);

  if (auth?.role !== "Admin") {
    return <Navigate to="/" replace />;
  }

  async function loadAll() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [usersData, personnelData] = await Promise.all([getUsers(), getPersonnelWithoutAccount()]);
      setUsers(usersData);
      setAvailablePersonnel(personnelData);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateModal(personnel: Personnel) {
    setSelectedPersonnel(personnel);
    setForm({
      username: suggestUsername(personnel.fullName),
      password: generateStrongPassword(),
      role: "User",
    });
    setFormError(null);
    setCreatedAccount(null);
  }

  function closeModal() {
    setSelectedPersonnel(null);
    setCreatedAccount(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!selectedPersonnel) return;

    setIsSubmitting(true);
    setFormError(null);
    try {
      await createUser({ ...form, personnelId: selectedPersonnel.id });
      setCreatedAccount({ username: form.username, password: form.password });
      await loadAll();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Layout title="FieldOps — Kullanıcı Yönetimi">
      {loadError && <p className="mb-6 text-sm text-red-400">{loadError}</p>}

      <h2 className="mb-3 text-sm font-semibold text-white">Hesaplar</h2>
      {isLoading ? (
        <Card className="p-6">
          <p className="text-sm text-slate-400">Yükleniyor...</p>
        </Card>
      ) : users.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-slate-400">Henüz hesap yok.</p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Kullanıcı Adı</TableHeaderCell>
                <TableHeaderCell>Rol</TableHeaderCell>
                <TableHeaderCell>Bağlı Personel</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-white">{user.username}</TableCell>
                  <TableCell>
                    <Badge>{user.role}</Badge>
                  </TableCell>
                  <TableCell>{user.personnelName ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <h2 className="mb-3 mt-8 text-sm font-semibold text-white">Hesabı Olmayan Personel</h2>
      {isLoading ? (
        <Card className="p-6">
          <p className="text-sm text-slate-400">Yükleniyor...</p>
        </Card>
      ) : availablePersonnel.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-slate-400">Tüm personelin bir hesabı var.</p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Ad Soyad</TableHeaderCell>
                <TableHeaderCell>Görev</TableHeaderCell>
                <TableHeaderCell>Durum</TableHeaderCell>
                <TableHeaderCell>Aksiyon</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {availablePersonnel.map((personnel) => (
                <TableRow key={personnel.id}>
                  <TableCell className="font-medium text-white">{personnel.fullName}</TableCell>
                  <TableCell>{personnel.role}</TableCell>
                  <TableCell>
                    <Badge>{personnel.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="secondary" onClick={() => openCreateModal(personnel)}>
                      <UserPlus size={14} />
                      Hesap Oluştur
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {selectedPersonnel && !createdAccount && (
        <Modal title={`${selectedPersonnel.fullName} için Hesap Oluştur`} onClose={closeModal}>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Kullanıcı Adı
              <input
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Geçici Şifre
              <div className="flex gap-2">
                <input
                  required
                  readOnly
                  value={form.password}
                  className="flex-1 rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 font-mono text-sm text-white outline-none"
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setForm({ ...form, password: generateStrongPassword() })}
                  aria-label="Yeni şifre üret"
                >
                  <RefreshCw size={16} />
                </Button>
              </div>
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Rol
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-white outline-none focus:border-brand-500"
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </label>

            {formError && <p className="text-sm text-red-400">{formError}</p>}

            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={closeModal} disabled={isSubmitting}>
                Vazgeç
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Oluşturuluyor..." : "Oluştur"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {selectedPersonnel && createdAccount && (
        <Modal title="Hesap Oluşturuldu" onClose={closeModal}>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <p>Bu şifreyi kaydedin, bir daha gösterilmeyecek.</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Kullanıcı Adı
              </p>
              <p className="mt-1 font-mono text-base text-white">{createdAccount.username}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Şifre</p>
              <p className="mt-1 font-mono text-base text-white">{createdAccount.password}</p>
            </div>

            <div className="mt-2 flex justify-end">
              <Button onClick={closeModal}>Kapat</Button>
            </div>
          </div>
        </Modal>
      )}
    </Layout>
  );
}

import { AlertCircle, Lock, User } from "lucide-react";
import { useState, type CSSProperties, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FeatureShowcase } from "../components/FeatureShowcase";
import { login } from "../lib/api";
import { setAuth } from "../lib/auth";

const blueprintGridStyle: CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
  backgroundSize: "48px 48px",
};

const stats = [
  { value: "6", label: "Şantiye" },
  { value: "20", label: "Personel" },
  { value: "15", label: "Makine" },
];

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const auth = await login(username, password);
      setAuth(auth);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş yapılamadı");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-navy-950">
      {/* Marka / tanıtım paneli — mobilde gizli */}
      <div className="relative hidden overflow-hidden bg-navy-900 lg:flex lg:w-1/2 lg:items-center lg:justify-center">
        <div className="pointer-events-none absolute inset-0" style={blueprintGridStyle} />
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-brand-500/5 blur-3xl" />

        <div className="relative z-10 max-w-md px-12">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-brand-500" />
            <span className="text-xl font-semibold text-white">FieldOps</span>
          </div>

          <h1 className="mt-8 text-3xl font-bold leading-tight text-white">
            Şantiye Operasyon
            <br />
            Yönetim Sistemi
          </h1>

          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            Şantiyelerinizdeki personel, makine ve malzeme operasyonlarını tek platformdan
            yönetin; gerçek zamanlı görünürlük ve kontrol sağlayın.
          </p>

          <div className="mt-8">
            <FeatureShowcase />
          </div>

          <div className="mt-8 flex items-center gap-6">
            {stats.map((stat, index) => (
              <div key={stat.label} className="flex items-center gap-6">
                {index > 0 && <div className="h-10 w-px bg-navy-700" />}
                <div>
                  <p className="text-2xl font-semibold text-white">{stat.value}</p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Giriş formu */}
      <div className="flex w-full items-center justify-center p-4 lg:w-1/2">
        <Card className="w-full max-w-sm p-8">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
            <span className="text-lg font-semibold text-white">FieldOps</span>
          </div>

          <h2 className="text-xl font-semibold text-white">Giriş Yap</h2>
          <p className="mt-1 text-sm text-slate-400">Şantiye operasyon yönetimine erişin.</p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Kullanıcı Adı
              <div className="relative">
                <User
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg border border-navy-600 bg-navy-800 py-2 pl-9 pr-3 text-white outline-none focus:border-brand-500"
                  placeholder="kullanici_adi"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Şifre
              <div className="relative">
                <Lock
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-navy-600 bg-navy-800 py-2 pl-9 pr-3 text-white outline-none focus:border-brand-500"
                  placeholder="••••••••"
                />
              </div>
            </label>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="mt-2 w-full justify-center">
              {isSubmitting ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

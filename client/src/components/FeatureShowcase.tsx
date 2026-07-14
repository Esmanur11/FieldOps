import { Building2, ClipboardCheck, Package, Truck, Users, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  comingSoon?: boolean;
}

const features: Feature[] = [
  {
    icon: Building2,
    title: "Şantiye Takibi",
    description: "Tüm şantiyelerinizi tek yerden görüntüleyin, ilerlemeyi haritada anlık takip edin.",
  },
  {
    icon: Users,
    title: "Personel Yönetimi",
    description: "Sahadaki ekibinizi organize edin, rolleri ve atamaları yönetin.",
  },
  {
    icon: Truck,
    title: "Makine & Ekipman",
    description: "İş makinelerinizin durumunu ve envanterini izleyin.",
  },
  {
    icon: Package,
    title: "Malzeme & Stok Takibi",
    description: "Şantiye malzemelerini gerçek zamanlı izleyin.",
    comingSoon: true,
  },
  {
    icon: ClipboardCheck,
    title: "Saha Denetimleri",
    description: "Denetim süreçlerinizi dijitalleştirin.",
    comingSoon: true,
  },
];

const INTERVAL_MS = 2500;
const TRANSITION_MS = 300;

export function FeatureShowcase() {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % features.length);
        setIsVisible(true);
      }, TRANSITION_MS);
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  function goTo(i: number) {
    if (i === index) return;
    setIsVisible(false);
    setTimeout(() => {
      setIndex(i);
      setIsVisible(true);
    }, TRANSITION_MS);
  }

  const feature = features[index];
  const Icon = feature.icon;

  return (
    <div>
      <div
        className={`flex min-h-[104px] items-start gap-4 rounded-xl border border-navy-700 bg-navy-800/50 p-5 transition-all duration-300 ease-out ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
          <Icon size={22} />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-white">{feature.title}</p>
            {feature.comingSoon && (
              <span className="rounded-full bg-navy-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Yakında
              </span>
            )}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-slate-400">{feature.description}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {features.map((f, i) => (
          <button
            key={f.title}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`${f.title} slaytına git`}
            aria-current={i === index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-brand-500" : "w-1.5 bg-navy-600 hover:bg-navy-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

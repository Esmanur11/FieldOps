import { Building2, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "./Badge";
import { Card } from "./Card";
import { ProgressRing } from "./ProgressRing";
import type { Site } from "../types/site";

interface SiteCardProps {
  site: Site;
}

export function SiteCard({ site }: SiteCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => navigate(`/sites/${site.id}`)}
      className="cursor-pointer p-5 transition-colors hover:border-navy-600"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
            <Building2 size={20} />
          </span>
          <div>
            <p className="font-medium text-white">{site.name}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
              <MapPin size={12} />
              {site.location ?? "—"}
            </p>
          </div>
        </div>
        <ProgressRing percentage={site.completionPercentage} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-navy-700 pt-3">
        <span className="text-xs text-slate-400">{site.startDate}</span>
        <Badge>{site.status}</Badge>
      </div>
    </Card>
  );
}

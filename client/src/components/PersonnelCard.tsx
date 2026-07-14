import { Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "./Avatar";
import { Card } from "./Card";
import { RoleBadge } from "./RoleBadge";
import type { Personnel } from "../types/personnel";

interface PersonnelCardProps {
  person: Personnel;
  siteName: string;
}

export function PersonnelCard({ person, siteName }: PersonnelCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => navigate(`/personnel/${person.id}`)}
      className="cursor-pointer p-5 transition-colors hover:border-navy-600"
    >
      <div className="flex items-center gap-3">
        <Avatar name={person.fullName} />
        <div>
          <p className="font-medium text-white">{person.fullName}</p>
          <p className="text-xs text-slate-400">{siteName}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-navy-700 pt-3">
        {person.phone ? (
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Phone size={12} />
            {person.phone}
          </span>
        ) : (
          <span className="text-xs text-slate-500">—</span>
        )}
        <RoleBadge role={person.role} />
      </div>
    </Card>
  );
}

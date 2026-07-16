export function getSeverityBadgeClasses(severity: string): string {
  switch (severity) {
    case "critical":
      return "border-red-500/30 bg-red-500/15 text-red-400";
    case "high":
      return "border-orange-500/30 bg-orange-500/15 text-orange-400";
    case "medium":
      return "border-amber-500/30 bg-amber-500/15 text-amber-400";
    default:
      return "border-slate-500/30 bg-slate-500/15 text-slate-400";
  }
}

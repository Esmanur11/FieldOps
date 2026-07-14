// Status/progress scale (not identity) — low completion reads as danger (red),
// mid as brand orange/amber, high as healthy green. Reused by ProgressRing and
// the map markers so the same percentage always maps to the same color.
export function getCompletionColor(percentage: number): string {
  if (percentage >= 75) return "#10b981"; // emerald-500 — tamamlanmaya yakın
  if (percentage >= 50) return "#f59e0b"; // amber-500 — orta
  if (percentage >= 25) return "#f97316"; // brand-500 — düşük-orta
  return "#ef4444"; // red-500 — kritik/düşük
}

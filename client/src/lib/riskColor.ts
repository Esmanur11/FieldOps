// Risk scale (inverted vs. completion) — low risk reads as healthy green, high risk as danger red.
export function getRiskColor(riskScore: number): string {
  if (riskScore >= 80) return "#ef4444"; // red-500 — kritik/yüksek risk
  if (riskScore >= 50) return "#f97316"; // brand-500 — orta-yüksek
  if (riskScore >= 25) return "#f59e0b"; // amber-500 — orta
  return "#10b981"; // emerald-500 — düşük risk
}

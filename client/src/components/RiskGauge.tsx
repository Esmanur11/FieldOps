import { getRiskColor } from "../lib/riskColor";

interface RiskGaugeProps {
  riskScore: number;
  size?: number;
}

export function RiskGauge({ riskScore, size = 96 }: RiskGaugeProps) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, riskScore));
  const offset = circumference * (1 - clamped / 100);
  const color = getRiskColor(clamped);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#334155"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-white">
        {Math.round(clamped)}
      </span>
    </div>
  );
}

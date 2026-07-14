import { LayoutGrid, List } from "lucide-react";

export type ViewMode = "card" | "table";

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-navy-600 bg-navy-800 p-1">
      <button
        type="button"
        onClick={() => onChange("card")}
        aria-pressed={view === "card"}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          view === "card" ? "bg-brand-500 text-white" : "text-slate-300 hover:text-white"
        }`}
      >
        <LayoutGrid size={14} />
        Kart
      </button>
      <button
        type="button"
        onClick={() => onChange("table")}
        aria-pressed={view === "table"}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          view === "table" ? "bg-brand-500 text-white" : "text-slate-300 hover:text-white"
        }`}
      >
        <List size={14} />
        Tablo
      </button>
    </div>
  );
}

import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

export function Table({ className = "", ...rest }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-navy-700">
      <table className={`w-full border-collapse text-left text-sm ${className}`} {...rest} />
    </div>
  );
}

export function TableHead({ className = "", ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={`bg-navy-800 ${className}`} {...rest} />;
}

export function TableBody({ className = "", ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={`divide-y divide-navy-800 ${className}`} {...rest} />;
}

export function TableRow({ className = "", ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={`hover:bg-navy-800/60 ${className}`} {...rest} />;
}

export function TableHeaderCell({
  className = "",
  ...rest
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 ${className}`}
      {...rest}
    />
  );
}

export function TableCell({
  className = "",
  ...rest
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`px-4 py-3 text-slate-200 ${className}`} {...rest} />;
}

import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className = "", children, ...rest }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-navy-700 bg-navy-900 shadow-lg shadow-black/20 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

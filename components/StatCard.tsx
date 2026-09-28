import Link from "next/link";
import type { ComponentType } from "react";

export function StatCard({
  label,
  value,
  href,
  Icon,
}: {
  label: string;
  value: string;
  href: string;
  Icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-orange-100 bg-white p-4 shadow-sm active:bg-orange-50"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs text-stone-500">{label}</p>
        <p className="mt-0.5 truncate text-xl font-bold text-stone-900">{value}</p>
      </div>
    </Link>
  );
}

import Link from "next/link";

export function StatCard({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-orange-100 bg-white p-4 shadow-sm active:bg-orange-50"
    >
      <p className="text-xs text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-stone-900">{value}</p>
    </Link>
  );
}

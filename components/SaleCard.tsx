import Link from "next/link";
import { FREQUENCY_LABELS } from "@/lib/frequency";
import { formatCurrency } from "@/lib/money";
import type { SaleCard as SaleCardData } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-2 text-sm">
      <span className="text-stone-500">{label}</span>
      <span className={strong ? "font-semibold text-stone-900" : "font-medium text-stone-700"}>
        {value}
      </span>
    </div>
  );
}

export function SaleCard({ sale }: { sale: SaleCardData }) {
  return (
    <Link
      href={`/ventas/${sale.id}`}
      className="block rounded-xl border border-orange-100 bg-white p-4 shadow-sm active:bg-orange-50"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-stone-900">{sale.productName}</h3>
          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
            {FREQUENCY_LABELS[sale.paymentFrequency]}
          </span>
        </div>
        <StatusBadge status={sale.status} />
      </div>

      <div className="mt-2 space-y-1">
        <Row label="Cliente" value={sale.customerName} />
        <Row label="Cuotas" value={`${sale.paidInstallments} de ${sale.installmentCount}`} />
        {sale.closedAt ? (
          <Row label="Cerrada el" value={new Date(sale.closedAt).toLocaleDateString("es-AR")} />
        ) : null}
        <Row label="Total cobrado" value={formatCurrency(sale.totalCollected)} strong />
      </div>

      {sale.closedThisWeek ? (
        <span className="mt-2 inline-block rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
          Cerrada esta semana
        </span>
      ) : null}
    </Link>
  );
}

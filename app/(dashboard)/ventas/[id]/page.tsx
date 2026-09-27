import Link from "next/link";
import { notFound } from "next/navigation";
import { getSaleDetail } from "@/actions/sales";
import { MarkPaymentModal } from "@/components/MarkPaymentModal";
import { StatusBadge } from "@/components/StatusBadge";
import { FREQUENCY_LABELS } from "@/lib/frequency";
import { formatCurrency } from "@/lib/money";

export default async function SaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sale = await getSaleDetail(id);
  if (!sale) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6">
      <Link href="/ventas" className="text-sm text-stone-500 hover:underline">
        ← Volver
      </Link>

      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">{sale.productName}</h1>
          <p className="text-sm text-stone-500">{sale.customerName}</p>
          <p className="text-xs text-stone-400">
            Venta del {new Date(sale.saleDate).toLocaleDateString("es-AR")} ·{" "}
            {FREQUENCY_LABELS[sale.paymentFrequency]}
          </p>
        </div>
        <StatusBadge status={sale.status} />
      </header>

      <section className="rounded-xl border border-orange-100 bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-medium text-stone-900">Detalle de la venta</h2>
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-stone-500">Cantidad</dt>
            <dd className="font-medium">{sale.quantity}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone-500">Monto por cuota</dt>
            <dd className="font-medium">{formatCurrency(sale.installmentAmount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone-500">Primer cobro</dt>
            <dd className="font-medium">
              {new Date(sale.firstDueDate).toLocaleDateString("es-AR")}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone-500">Cuotas</dt>
            <dd className="font-medium">
              {sale.paidInstallments} de {sale.installmentCount}
            </dd>
          </div>
          <div className="flex justify-between text-base">
            <dt className="font-semibold text-stone-900">Total cobrado</dt>
            <dd className="font-bold">{formatCurrency(sale.totalCollected)}</dd>
          </div>
          {sale.notes ? (
            <div className="border-t border-orange-100 pt-1.5">
              <dt className="text-stone-500">Observaciones</dt>
              <dd className="mt-0.5">{sale.notes}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <MarkPaymentModal saleId={sale.id} disabled={sale.status === "COMPLETADO"} />

      <section>
        <h2 className="mb-2 font-medium text-stone-900">Historial de cobros</h2>
        {sale.payments.length === 0 ? (
          <p className="text-sm text-stone-500">Todavía no se registraron cobros.</p>
        ) : (
          <ul className="divide-y divide-orange-100 rounded-xl border border-orange-100 bg-white text-sm shadow-sm">
            {sale.payments.map((payment) => (
              <li key={payment.id} className="flex justify-between px-4 py-2">
                <span>{new Date(payment.paymentDate).toLocaleDateString("es-AR")}</span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(payment.amountPaid)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

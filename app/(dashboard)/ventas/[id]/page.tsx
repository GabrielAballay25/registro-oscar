import Link from "next/link";
import { notFound } from "next/navigation";
import { getSaleDetail } from "@/actions/sales";
import { RegisterPaymentForm } from "@/components/RegisterPaymentForm";
import { StatusBadge } from "@/components/StatusBadge";
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
          <h1 className="text-xl font-semibold text-stone-900">{sale.customerName}</h1>
          {sale.notes ? <p className="text-sm text-stone-500">{sale.notes}</p> : null}
          <p className="text-xs text-stone-400">
            Venta del {new Date(sale.createdAt).toLocaleDateString("es-AR")}
          </p>
        </div>
        <StatusBadge status={sale.status} />
      </header>

      <section className="rounded-xl border border-orange-100 bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-medium text-stone-900">Detalle de la venta</h2>
        <ul className="divide-y divide-orange-50 text-sm">
          {sale.items.map((item) => (
            <li key={item.id} className="flex justify-between py-1.5">
              <span>
                {item.quantity} × {item.productName}
              </span>
              <span className="tabular-nums">{formatCurrency(item.subtotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t border-orange-100 pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500">Total</span>
            <span className="font-medium">{formatCurrency(sale.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Pagado</span>
            <span className="font-medium">{formatCurrency(sale.paid)}</span>
          </div>
          <div className="flex justify-between text-base">
            <span className="font-semibold">Saldo</span>
            <span className="font-bold">{formatCurrency(sale.balance)}</span>
          </div>
        </div>
      </section>

      <RegisterPaymentForm saleId={sale.id} initialStatus={sale.status} />

      <section>
        <h2 className="mb-2 font-medium text-stone-900">Historial de cobros</h2>
        {sale.payments.length === 0 ? (
          <p className="text-sm text-stone-500">Todavía no se registraron cobros.</p>
        ) : (
          <ul className="divide-y divide-orange-100 rounded-xl border border-orange-100 bg-white text-sm shadow-sm">
            {sale.payments.map((payment) => (
              <li key={payment.id} className="flex justify-between px-4 py-2">
                <div>
                  <p>
                    {new Date(payment.paymentDate).toLocaleDateString("es-AR")} ·{" "}
                    {payment.paymentMethod}
                  </p>
                  {payment.note ? (
                    <p className="text-xs text-stone-500">{payment.note}</p>
                  ) : null}
                </div>
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

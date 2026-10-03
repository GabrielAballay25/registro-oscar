import { getClosureHistory, getWeeklyClosureSummary } from "@/actions/payments";
import { CloseWeekButton } from "@/components/CloseWeekButton";
import { PageHeader } from "@/components/PageHeader";
import { IconWallet } from "@/components/icons";
import { formatCurrency } from "@/lib/money";
import { formatDateAR } from "@/lib/temporal";

export default async function CobrosPage() {
  const [summary, history] = await Promise.all([
    getWeeklyClosureSummary(),
    getClosureHistory(),
  ]);

  const start = new Date(summary.startDate);
  const end = new Date(summary.endDate);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6">
      <PageHeader title="Cobros" subtitle="Cierre de caja semanal." Icon={IconWallet} />

      <section className="rounded-xl border border-orange-100 bg-white p-4 shadow-sm">
        <p className="text-sm text-stone-500">
          Semana del {formatDateAR(start)} al {formatDateAR(end)}
        </p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-stone-900">
          {formatCurrency(summary.total)}
        </p>

        {summary.payments.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">
            Todavía no se registraron cobros esta semana.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-orange-50 text-sm">
            {summary.payments.map((payment) => (
              <li key={payment.id} className="flex items-center gap-2 py-1.5">
                <IconWallet className="h-4 w-4 shrink-0 text-orange-400" />
                <span className="flex-1">
                  {formatDateAR(new Date(payment.paymentDate))} ·{" "}
                  {payment.customerName} ({payment.productName})
                </span>
                <span className="tabular-nums">{formatCurrency(payment.amountPaid)}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4">
          <CloseWeekButton />
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-medium text-stone-900">Cierres anteriores</h2>
        {history.length === 0 ? (
          <p className="text-sm text-stone-500">Todavía no se cerró ninguna semana.</p>
        ) : (
          <ul className="divide-y divide-orange-100 rounded-xl border border-orange-100 bg-white text-sm shadow-sm">
            {history.map((closure) => (
              <li key={closure.id} className="flex items-center gap-2 px-4 py-2">
                <IconWallet className="h-4 w-4 shrink-0 text-orange-400" />
                <span className="flex-1">
                  {formatDateAR(new Date(closure.startDate))} —{" "}
                  {formatDateAR(new Date(closure.endDate))}
                </span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(closure.totalAmount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

import Link from "next/link";
import { getClosureHistory, getWeeklyClosureSummary } from "@/actions/payments";
import { CloseWeekButton } from "@/components/CloseWeekButton";
import { formatCurrency } from "@/lib/money";

export default async function WeeklyClosurePage() {
  const [summary, history] = await Promise.all([
    getWeeklyClosureSummary(),
    getClosureHistory(),
  ]);

  const start = new Date(summary.startDate);
  const end = new Date(summary.endDate);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-8">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← Volver
      </Link>
      <h1 className="text-2xl font-semibold text-zinc-900">Cierre de caja semanal</h1>

      <section className="rounded-xl border border-zinc-200 p-4">
        <p className="text-sm text-zinc-500">
          Semana del {start.toLocaleDateString("es-AR")} al {end.toLocaleDateString("es-AR")}
        </p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-zinc-900">
          {formatCurrency(summary.total)}
        </p>

        {summary.payments.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">Todavía no se registraron cobros esta semana.</p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-100 text-sm">
            {summary.payments.map((payment) => (
              <li key={payment.id} className="flex justify-between py-1.5">
                <span>
                  {new Date(payment.paymentDate).toLocaleDateString("es-AR")} ·{" "}
                  {payment.customerName} ({payment.paymentMethod})
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
        <h2 className="mb-2 font-medium text-zinc-900">Cierres anteriores</h2>
        {history.length === 0 ? (
          <p className="text-sm text-zinc-500">Todavía no se cerró ninguna semana.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 text-sm">
            {history.map((closure) => (
              <li key={closure.id} className="flex justify-between px-4 py-2">
                <span>
                  {new Date(closure.startDate).toLocaleDateString("es-AR")} —{" "}
                  {new Date(closure.endDate).toLocaleDateString("es-AR")}
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

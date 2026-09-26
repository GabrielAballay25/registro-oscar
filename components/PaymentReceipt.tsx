import { formatCurrency } from "@/lib/money";
import type { PaymentReceiptData } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  Efectivo: "Efectivo",
  Transferencia: "Transferencia",
};

/**
 * Comprobante de cobro pensado para capturarlo con el celular y enviarlo
 * al cliente: fondo blanco, ancho acotado, buen contraste, sin elementos de
 * navegación alrededor.
 */
export function PaymentReceipt({ receipt }: { receipt: PaymentReceiptData }) {
  const balanceCents = receipt.balance.startsWith("-") ? 0 : Number(receipt.balance);
  const isPaidOff = receipt.saleStatus === "COMPLETADO";

  return (
    <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-900 shadow-sm">
      <div className="flex items-center justify-between border-b border-dashed border-zinc-300 pb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Comprobante de cobro
          </p>
          <p className="text-lg font-semibold">{receipt.customerName}</p>
        </div>
        <StatusBadge status={receipt.saleStatus} />
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-sm text-zinc-500">Monto cobrado</span>
        <span className="text-3xl font-bold tabular-nums text-zinc-900">
          {formatCurrency(receipt.amountPaid)}
        </span>
      </div>

      <dl className="mt-4 space-y-1.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-zinc-500">Fecha</dt>
          <dd className="font-medium">
            {new Date(receipt.paymentDate).toLocaleDateString("es-AR")}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-zinc-500">Medio de pago</dt>
          <dd className="font-medium">
            {PAYMENT_METHOD_LABELS[receipt.paymentMethod] ?? receipt.paymentMethod}
          </dd>
        </div>
        {receipt.note ? (
          <div className="flex justify-between gap-4">
            <dt className="shrink-0 text-zinc-500">Nota</dt>
            <dd className="text-right font-medium">{receipt.note}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-4 rounded-lg bg-zinc-50 p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-500">Total de la venta</span>
          <span className="font-medium">{formatCurrency(receipt.saleTotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Total abonado a la fecha</span>
          <span className="font-medium">{formatCurrency(receipt.totalPaid)}</span>
        </div>
        <div className="mt-1.5 flex justify-between border-t border-zinc-200 pt-1.5">
          <span className="font-medium text-zinc-700">Saldo restante</span>
          <span
            className={`font-bold tabular-nums ${isPaidOff || balanceCents <= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {isPaidOff ? "$0,00 — Saldada" : formatCurrency(receipt.balance)}
          </span>
        </div>
      </div>

      <div className="mt-4 border-t border-zinc-100 pt-3">
        <p className="text-xs font-medium text-zinc-500">Detalle de la venta</p>
        <ul className="mt-1.5 space-y-1 text-xs text-zinc-600">
          {receipt.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-2">
              <span>
                {item.quantity} × {item.productName}
              </span>
              <span className="shrink-0 tabular-nums">{formatCurrency(item.subtotal)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

import { formatCurrency } from "@/lib/money";
import { formatDateAR } from "@/lib/temporal";
import type { PaymentReceiptData } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

/**
 * Comprobante de cobro pensado para capturarlo con el celular y enviarlo
 * al cliente: fondo blanco, ancho acotado, buen contraste, sin elementos de
 * navegación alrededor.
 */
export function PaymentReceipt({ receipt }: { receipt: PaymentReceiptData }) {
  const isPaidOff = receipt.saleStatus === "COMPLETADO";

  return (
    <div className="w-full max-w-sm rounded-2xl border border-orange-100 bg-white p-6 text-stone-900 shadow-sm">
      <div className="flex items-center justify-between border-b border-dashed border-orange-200 pb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-orange-600">
            Comprobante de cobro
          </p>
          <p className="text-lg font-semibold">{receipt.customerName}</p>
          <p className="text-xs text-stone-500">{receipt.productName}</p>
        </div>
        <StatusBadge status={receipt.saleStatus} />
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-sm text-stone-500">Monto cobrado</span>
        <span className="text-3xl font-bold tabular-nums text-stone-900">
          {formatCurrency(receipt.amountPaid)}
        </span>
      </div>

      <dl className="mt-4 space-y-1.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-stone-500">Fecha</dt>
          <dd className="font-medium">
            {formatDateAR(new Date(receipt.paymentDate))}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-stone-500">Cuota</dt>
          <dd className="font-medium">
            {receipt.installmentNumber} de {receipt.installmentCount}
          </dd>
        </div>
      </dl>

      <div className="mt-4 rounded-lg bg-orange-50 p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-stone-500">Total cobrado a la fecha</span>
          <span className="font-medium">{formatCurrency(receipt.totalCollected)}</span>
        </div>
        <div className="mt-1.5 flex justify-between border-t border-orange-200 pt-1.5">
          <span className="font-medium text-stone-700">Estado</span>
          <span className={`font-bold ${isPaidOff ? "text-emerald-600" : "text-stone-700"}`}>
            {isPaidOff ? "Saldada" : `Cuota ${receipt.installmentNumber} de ${receipt.installmentCount}`}
          </span>
        </div>
      </div>
    </div>
  );
}

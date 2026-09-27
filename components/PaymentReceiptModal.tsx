"use client";

import type { PaymentReceiptData } from "@/lib/types";
import { PaymentReceipt } from "./PaymentReceipt";

export function PaymentReceiptModal({
  receipt,
  onClose,
}: {
  receipt: PaymentReceiptData;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:bg-white print:p-0">
      <div className="flex max-h-full flex-col items-center gap-4">
        <div id="receipt-print-area">
          <PaymentReceipt receipt={receipt} />
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-stone-900 shadow hover:bg-orange-50"
          >
            Imprimir / Guardar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-orange-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

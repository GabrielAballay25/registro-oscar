"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { registerPayment } from "@/actions/payments";
import type { ActionResult, PaymentReceiptData } from "@/lib/types";
import { PaymentReceiptModal } from "./PaymentReceiptModal";

type State = ActionResult<PaymentReceiptData> | null;

function todayIsoDate(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

export function RegisterPaymentForm({
  saleId,
  initialStatus,
}: {
  saleId: string;
  initialStatus: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [dismissedPaymentId, setDismissedPaymentId] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState<State, FormData>(
    async (_prev, formData) => {
      return registerPayment({
        saleId,
        amountPaid: String(formData.get("amountPaid") ?? ""),
        paymentDate: String(formData.get("paymentDate") ?? ""),
        paymentMethod: String(formData.get("paymentMethod") ?? "Efectivo"),
        note: String(formData.get("note") ?? ""),
      });
    },
    null,
  );

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  const receipt = state?.success ? state.data : null;
  const showReceipt = !!receipt && receipt.paymentId !== dismissedPaymentId;
  // Usamos el status del último recibo (más reciente) y, si todavía no hay
  // ninguno, el que vino del servidor al cargar la página. Este componente
  // se mantiene siempre montado (ver app/(dashboard)/ventas/[id]/page.tsx) para que el
  // pago que salda la venta no desmonte el formulario y se pierda el
  // comprobante antes de que el usuario llegue a verlo.
  const isSaleCompleted = (receipt?.saleStatus ?? initialStatus) === "COMPLETADO";

  return (
    <>
      {isSaleCompleted ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Esta venta ya está saldada. No se pueden registrar más cobros.
        </div>
      ) : (
        <form
          ref={formRef}
          action={formAction}
          className="space-y-3 rounded-xl border border-orange-100 bg-white p-4 shadow-sm"
        >
          <h2 className="font-medium text-stone-900">Registrar cobro</h2>

          {state && !state.success ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-stone-600">Monto</span>
              <input
                name="amountPaid"
                type="number"
                step="0.01"
                min="0.01"
                required
                className="rounded-md border border-stone-300 px-3 py-1.5"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-stone-600">Fecha</span>
              <input
                name="paymentDate"
                type="date"
                required
                defaultValue={todayIsoDate()}
                className="rounded-md border border-stone-300 px-3 py-1.5"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-stone-600">Medio de pago</span>
            <select
              name="paymentMethod"
              defaultValue="Efectivo"
              className="rounded-md border border-stone-300 px-3 py-1.5"
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-stone-600">Nota (opcional)</span>
            <input
              name="note"
              type="text"
              placeholder="Ej: cuota 2"
              className="rounded-md border border-stone-300 px-3 py-1.5"
            />
          </label>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {isPending ? "Registrando..." : "Registrar cobro"}
          </button>
        </form>
      )}

      {showReceipt && receipt ? (
        <PaymentReceiptModal
          receipt={receipt}
          onClose={() => setDismissedPaymentId(receipt.paymentId)}
        />
      ) : null}
    </>
  );
}

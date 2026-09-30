"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { registerPayment } from "@/actions/payments";
import type { ActionResult, PaymentReceiptData } from "@/lib/types";
import { IconWallet } from "./icons";
import { InstallmentBalanceNote } from "./InstallmentBalanceNote";
import { PaymentReceiptModal } from "./PaymentReceiptModal";

type State = ActionResult<PaymentReceiptData> | null;

function todayIsoDate(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

export function MarkPaymentModal({
  saleId,
  disabled,
  installmentBalance,
}: {
  saleId: string;
  disabled: boolean;
  installmentBalance: string;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [dismissedPaymentId, setDismissedPaymentId] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState<State, FormData>(
    async (_prev, formData) => {
      return registerPayment({
        saleId,
        amountPaid: String(formData.get("amountPaid") ?? ""),
        paymentDate: String(formData.get("paymentDate") ?? ""),
      });
    },
    null,
  );

  useEffect(() => {
    if (state?.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- cierra el modal al confirmar un cobro; sólo corre en la transición discreta que dispara useActionState, no en cada render.
      setOpen(false);
      formRef.current?.reset();
    }
  }, [state]);

  const receipt = state?.success ? state.data : null;
  const showReceipt = !!receipt && receipt.paymentId !== dismissedPaymentId;
  // `disabled` llega como prop del servidor (sale.status ya "COMPLETADO" en
  // otra carga) y también puede volverse true en esta misma sesión cuando el
  // pago que se acaba de marcar salda la venta. En ese segundo caso NO hay
  // que dejar de renderizar el modal del comprobante (showReceipt más abajo)
  // — por eso el botón/formulario se ocultan condicionalmente, pero el
  // bloque del comprobante queda siempre alcanzable.
  const isSaleCompleted = disabled || receipt?.saleStatus === "COMPLETADO";

  return (
    <>
      {isSaleCompleted ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Esta venta ya está saldada. No se pueden registrar más cobros.
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
        >
          <IconWallet className="h-4 w-4" />
          Marcar cobro
        </button>
      )}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <form
            ref={formRef}
            action={formAction}
            className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-5 shadow-lg"
          >
            <h2 className="font-semibold text-stone-900">Marcar cobro</h2>

            <InstallmentBalanceNote balance={installmentBalance} />

            {state && !state.success ? (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
            ) : null}

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-stone-600">Fecha</span>
              <input
                name="paymentDate"
                type="date"
                required
                defaultValue={todayIsoDate()}
                className="rounded-md border border-stone-300 px-3 py-2"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-stone-600">Monto</span>
              <input
                name="amountPaid"
                type="number"
                step="0.01"
                min="0.01"
                required
                className="rounded-md border border-stone-300 px-3 py-2"
              />
            </label>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
              >
                {isPending ? "Guardando..." : "Confirmar"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {showReceipt && receipt ? (
        <PaymentReceiptModal
          receipt={receipt}
          onClose={() => setDismissedPaymentId(receipt.paymentId)}
        />
      ) : null}
    </>
  );
}

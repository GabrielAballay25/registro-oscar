"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateSale } from "@/actions/sales";
import { FREQUENCY_DAYS, FREQUENCY_LABELS } from "@/lib/frequency";
import type { ActionResult, PaymentFrequency, SaleDetail } from "@/lib/types";

type State = ActionResult<null> | null;

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

export function EditSaleForm({ sale }: { sale: SaleDetail }) {
  const router = useRouter();
  const [frequency, setFrequency] = useState<PaymentFrequency>(sale.paymentFrequency);

  const [state, formAction, isPending] = useActionState<State, FormData>(
    async (_prev, formData) => {
      return updateSale(sale.id, {
        quantity: Number(formData.get("quantity") ?? 1),
        saleDate: String(formData.get("saleDate") ?? ""),
        installmentAmount: String(formData.get("installmentAmount") ?? ""),
        paymentFrequency: String(formData.get("paymentFrequency") ?? "SEMANAL") as PaymentFrequency,
        firstDueDate: String(formData.get("firstDueDate") ?? ""),
        installmentCount: Number(formData.get("installmentCount") ?? 1),
        notes: String(formData.get("notes") ?? ""),
      });
    },
    null,
  );

  useEffect(() => {
    if (state?.success) {
      router.push(`/ventas/${sale.id}`);
    }
  }, [state, router, sale.id]);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-orange-100 bg-white p-4 shadow-sm"
    >
      {state && !state.success ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}

      <div className="rounded-lg bg-stone-50 p-3 text-sm text-stone-600">
        <p>
          <span className="text-stone-400">Cliente: </span>
          {sale.customerName}
        </p>
        <p>
          <span className="text-stone-400">Producto: </span>
          {sale.productName}
        </p>
        <p className="mt-1 text-xs text-stone-400">
          El cliente y el producto no se pueden cambiar; si están mal, eliminá esta venta y
          cargala de nuevo.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-stone-600">Cantidad *</span>
          <input
            name="quantity"
            type="number"
            min={1}
            required
            defaultValue={sale.quantity}
            className="rounded-md border border-stone-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-stone-600">Fecha de venta</span>
          <input
            name="saleDate"
            type="date"
            required
            defaultValue={toDateInputValue(sale.saleDate)}
            className="rounded-md border border-stone-300 px-3 py-2"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-stone-600">Cada cuánto se cobra *</span>
          <select
            name="paymentFrequency"
            required
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as PaymentFrequency)}
            className="rounded-md border border-stone-300 px-3 py-2"
          >
            {(Object.keys(FREQUENCY_LABELS) as PaymentFrequency[]).map((freq) => (
              <option key={freq} value={freq}>
                {FREQUENCY_LABELS[freq]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-stone-600">Cantidad de cuotas *</span>
          <input
            name="installmentCount"
            type="number"
            min={1}
            required
            defaultValue={sale.installmentCount}
            className="rounded-md border border-stone-300 px-3 py-2"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-stone-600">Monto por cuota *</span>
        <input
          name="installmentAmount"
          type="number"
          step="0.01"
          min="0.01"
          required
          defaultValue={sale.installmentAmount}
          className="rounded-md border border-stone-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-stone-600">Fecha de inicio del cobro *</span>
        <input
          name="firstDueDate"
          type="date"
          required
          defaultValue={toDateInputValue(sale.firstDueDate)}
          className="rounded-md border border-stone-300 px-3 py-2"
        />
        <span className="text-xs text-stone-400">
          La primera cuota vence esta fecha; las siguientes, cada {FREQUENCY_DAYS[frequency]} días.
        </span>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-stone-600">Observaciones</span>
        <textarea
          name="notes"
          rows={2}
          defaultValue={sale.notes ?? ""}
          className="rounded-md border border-stone-300 px-3 py-2"
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}

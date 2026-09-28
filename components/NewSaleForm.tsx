"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSale } from "@/actions/sales";
import { Combobox } from "./Combobox";
import { FREQUENCY_DAYS, FREQUENCY_LABELS } from "@/lib/frequency";
import type { ActionResult, CustomerRecord, PaymentFrequency, ProductOption } from "@/lib/types";

type State = ActionResult<{ id: string }> | null;

function todayIsoDate(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

export function NewSaleForm({
  customers,
  products,
}: {
  customers: CustomerRecord[];
  products: ProductOption[];
}) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [frequency, setFrequency] = useState<PaymentFrequency>("SEMANAL");

  const [state, formAction, isPending] = useActionState<State, FormData>(
    async (_prev, formData) => {
      return createSale({
        customerId: String(formData.get("customerId") ?? ""),
        productId: String(formData.get("productId") ?? ""),
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
      router.push(`/ventas/${state.data.id}`);
    }
  }, [state, router]);

  const customerOptions = customers.map((c) => ({
    id: c.id,
    label: `${c.firstName} ${c.lastName}`,
  }));
  const productOptions = products.map((p) => ({
    id: p.id,
    label: p.name,
    sublabel: `stock: ${p.stock}`,
  }));

  const noCustomers = customers.length === 0;
  const noProducts = products.length === 0;

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-orange-100 bg-white p-4 shadow-sm"
    >
      {state && !state.success ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-stone-600">Cliente *</span>
          <Combobox
            name="customerId"
            placeholder="Buscar por nombre o apellido..."
            options={customerOptions}
            value={customerId}
            onChange={setCustomerId}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-stone-600">Producto *</span>
          <Combobox
            name="productId"
            placeholder="Buscar por nombre del producto..."
            options={productOptions}
            value={productId}
            onChange={setProductId}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-stone-600">Cantidad *</span>
          <input
            name="quantity"
            type="number"
            min={1}
            defaultValue={1}
            required
            className="rounded-md border border-stone-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-stone-600">Fecha de venta</span>
          <input
            name="saleDate"
            type="date"
            required
            defaultValue={todayIsoDate()}
            className="rounded-md border border-stone-300 px-3 py-2"
          />
        </label>
      </div>

      <div className="rounded-lg bg-orange-50 p-3 text-sm text-stone-700">
        Esta venta se cobra en <strong>cuotas periódicas</strong>. Si es un pago único, dejá la
        cantidad de cuotas en <strong>1</strong>.
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
            defaultValue={1}
            required
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
          placeholder="Lo que el cliente te da cada vez"
          className="rounded-md border border-stone-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-stone-600">Fecha de inicio del cobro *</span>
        <input
          name="firstDueDate"
          type="date"
          required
          defaultValue={todayIsoDate()}
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
          placeholder="Notas sobre esta venta (opcional)"
          className="rounded-md border border-stone-300 px-3 py-2"
        />
      </label>

      <button
        type="submit"
        disabled={isPending || noCustomers || noProducts}
        className="w-full rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Registrar venta"}
      </button>

      {noCustomers ? (
        <p className="text-sm text-amber-600">
          No hay clientes cargados.{" "}
          <Link href="/clientes" className="underline">
            Cargá uno primero
          </Link>
          .
        </p>
      ) : null}
      {noProducts ? (
        <p className="text-sm text-amber-600">
          No hay productos cargados.{" "}
          <Link href="/productos" className="underline">
            Cargá uno primero
          </Link>
          .
        </p>
      ) : null}
    </form>
  );
}

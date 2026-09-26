"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSale } from "@/actions/sales";
import type { ActionResult, ProductOption } from "@/lib/types";

type SaleItemRow = { productId: string; quantity: number };
type State = ActionResult<{ id: string }> | null;

export function NewSaleForm({ products }: { products: ProductOption[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<SaleItemRow[]>([
    { productId: products[0]?.id ?? "", quantity: 1 },
  ]);

  const [state, formAction, isPending] = useActionState<State, FormData>(
    async (_prev, formData) => {
      const productIds = formData.getAll("productId") as string[];
      const quantities = formData.getAll("quantity") as string[];
      const items: SaleItemRow[] = productIds.map((productId, index) => ({
        productId,
        quantity: Number(quantities[index] ?? 0),
      }));

      return createSale({
        customerName: String(formData.get("customerName") ?? ""),
        notes: String(formData.get("notes") ?? ""),
        items,
      });
    },
    null,
  );

  useEffect(() => {
    if (state?.success) {
      router.push(`/ventas/${state.data.id}`);
    }
  }, [state, router]);

  function updateRow(index: number, patch: Partial<SaleItemRow>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setRows((prev) => [...prev, { productId: products[0]?.id ?? "", quantity: 1 }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  const total = rows.reduce((acc, row) => {
    const product = products.find((p) => p.id === row.productId);
    if (!product) return acc;
    return acc + Number(product.price) * row.quantity;
  }, 0);

  return (
    <form action={formAction} className="space-y-4">
      {state && !state.success ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-600">Cliente</span>
        <input
          name="customerName"
          required
          placeholder="Nombre del cliente"
          className="rounded-md border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-600">
          Notas (modalidad de pago, ej: cuotas semanales de $5000)
        </span>
        <input name="notes" className="rounded-md border border-zinc-300 px-3 py-2" />
      </label>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-700">Productos</span>
          <button
            type="button"
            onClick={addRow}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            + Agregar producto
          </button>
        </div>

        {rows.map((row, index) => (
          <div key={index} className="flex items-center gap-2">
            <select
              name="productId"
              value={row.productId}
              onChange={(e) => updateRow(index, { productId: e.target.value })}
              className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="">Seleccionar producto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} — ${product.price} (stock: {product.stock})
                </option>
              ))}
            </select>
            <input
              name="quantity"
              type="number"
              min={1}
              value={row.quantity}
              onChange={(e) => updateRow(index, { quantity: Number(e.target.value) })}
              className="w-20 rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => removeRow(index)}
              disabled={rows.length === 1}
              className="text-sm text-red-500 hover:underline disabled:opacity-30"
            >
              Quitar
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-zinc-200 pt-3">
        <span className="text-sm text-zinc-600">Total estimado</span>
        <span className="text-lg font-semibold">
          ${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
        </span>
      </div>

      <button
        type="submit"
        disabled={isPending || products.length === 0}
        className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Registrar venta"}
      </button>

      {products.length === 0 ? (
        <p className="text-sm text-amber-600">
          No hay productos cargados todavía.{" "}
          <a href="/productos" className="underline">
            Cargá uno primero
          </a>
          .
        </p>
      ) : null}
    </form>
  );
}

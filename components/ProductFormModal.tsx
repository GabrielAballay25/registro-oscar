"use client";

import { useActionState, useEffect, useRef } from "react";
import { createProduct, updateProduct, type ProductInput } from "@/actions/products";
import type { ActionResult, ProductOption } from "@/lib/types";

type State = ActionResult<ProductOption> | null;

export function ProductFormModal({
  product,
  onClose,
  onSaved,
}: {
  /** null = alta de un producto nuevo; un registro = edición. */
  product: ProductOption | null;
  onClose: () => void;
  onSaved: (product: ProductOption) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState<State, FormData>(
    async (_prev, formData) => {
      const input: ProductInput = {
        name: String(formData.get("name") ?? ""),
        description: String(formData.get("description") ?? ""),
        stock: Number(formData.get("stock") ?? 0),
      };
      return product ? updateProduct(product.id, input) : createProduct(input);
    },
    null,
  );

  useEffect(() => {
    if (state?.success) {
      onSaved(state.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <form
        ref={formRef}
        action={formAction}
        className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-5 shadow-lg"
      >
        <h2 className="font-semibold text-stone-900">
          {product ? "Editar producto" : "Nuevo producto"}
        </h2>

        {state && !state.success ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        ) : null}

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-stone-600">Nombre *</span>
          <input
            name="name"
            required
            defaultValue={product?.name}
            className="rounded-md border border-stone-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-stone-600">Descripción</span>
          <textarea
            name="description"
            rows={2}
            defaultValue={product?.description ?? ""}
            className="rounded-md border border-stone-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-stone-600">Stock *</span>
          <input
            name="stock"
            type="number"
            min="0"
            step="1"
            defaultValue={product?.stock ?? 0}
            required
            className="rounded-md border border-stone-300 px-3 py-2"
          />
        </label>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {isPending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

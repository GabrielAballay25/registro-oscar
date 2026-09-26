"use client";

import { useActionState, useEffect, useRef } from "react";
import { createProduct } from "@/actions/products";
import type { ActionResult, ProductOption } from "@/lib/types";

type State = ActionResult<ProductOption> | null;

export function NewProductForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState<State, FormData>(
    async (_prev, formData) => {
      return createProduct({
        name: String(formData.get("name") ?? ""),
        description: String(formData.get("description") ?? ""),
        price: String(formData.get("price") ?? "0"),
        stock: Number(formData.get("stock") ?? 0),
      });
    },
    null,
  );

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-3 rounded-xl border border-zinc-200 p-4"
    >
      <h2 className="font-medium text-zinc-900">Nuevo producto</h2>

      {state && !state.success ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-600">Nombre</span>
        <input name="name" required className="rounded-md border border-zinc-300 px-3 py-1.5" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-600">Descripción (opcional)</span>
        <input name="description" className="rounded-md border border-zinc-300 px-3 py-1.5" />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600">Precio</span>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            className="rounded-md border border-zinc-300 px-3 py-1.5"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600">Stock inicial</span>
          <input
            name="stock"
            type="number"
            min="0"
            step="1"
            defaultValue={0}
            required
            className="rounded-md border border-zinc-300 px-3 py-1.5"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Agregar producto"}
      </button>
    </form>
  );
}

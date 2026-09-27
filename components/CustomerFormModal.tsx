"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCustomer, updateCustomer, type CustomerInput } from "@/actions/customers";
import type { ActionResult, CustomerRecord } from "@/lib/types";

type State = ActionResult<CustomerRecord> | null;

export function CustomerFormModal({
  customer,
  onClose,
  onSaved,
}: {
  /** null = alta de un cliente nuevo; un registro = edición. */
  customer: CustomerRecord | null;
  onClose: () => void;
  onSaved: (customer: CustomerRecord) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState<State, FormData>(
    async (_prev, formData) => {
      const input: CustomerInput = {
        firstName: String(formData.get("firstName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        address: String(formData.get("address") ?? ""),
        notes: String(formData.get("notes") ?? ""),
      };
      return customer ? updateCustomer(customer.id, input) : createCustomer(input);
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
        className="max-h-[85vh] w-full max-w-sm space-y-3 overflow-y-auto rounded-2xl bg-white p-5 shadow-lg"
      >
        <h2 className="font-semibold text-stone-900">
          {customer ? "Editar cliente" : "Nuevo cliente"}
        </h2>

        {state && !state.success ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-stone-600">Nombre *</span>
            <input
              name="firstName"
              required
              defaultValue={customer?.firstName}
              className="rounded-md border border-stone-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-stone-600">Apellido *</span>
            <input
              name="lastName"
              required
              defaultValue={customer?.lastName}
              className="rounded-md border border-stone-300 px-3 py-2"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-stone-600">Teléfono</span>
          <input
            name="phone"
            defaultValue={customer?.phone ?? ""}
            className="rounded-md border border-stone-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-stone-600">Dirección</span>
          <input
            name="address"
            defaultValue={customer?.address ?? ""}
            className="rounded-md border border-stone-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-stone-600">Observación</span>
          <textarea
            name="notes"
            rows={2}
            defaultValue={customer?.notes ?? ""}
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

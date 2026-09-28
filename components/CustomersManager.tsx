"use client";

import { useEffect, useState } from "react";
import { deleteCustomer, listCustomers } from "@/actions/customers";
import type { CustomerRecord } from "@/lib/types";
import { CustomerFormModal } from "./CustomerFormModal";
import { Fab } from "./Fab";
import { IconPencil, IconTrash, IconUsers } from "./icons";

export function CustomersManager({ initialCustomers }: { initialCustomers: CustomerRecord[] }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  // undefined = cerrado, null = alta, un registro = edición
  const [modalCustomer, setModalCustomer] = useState<CustomerRecord | null | undefined>(undefined);

  useEffect(() => {
    const handle = setTimeout(() => {
      listCustomers({ search, sortDir }).then(setCustomers);
    }, 250);
    return () => clearTimeout(handle);
  }, [search, sortDir]);

  async function refresh() {
    setCustomers(await listCustomers({ search, sortDir }));
  }

  async function handleDelete(customer: CustomerRecord) {
    if (!confirm(`¿Eliminar a ${customer.firstName} ${customer.lastName}?`)) return;
    const result = await deleteCustomer(customer.id);
    if (!result.success) {
      alert(result.error);
      return;
    }
    await refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o apellido..."
          className="flex-1 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          title="Cambiar orden alfabético"
          className="shrink-0 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
        >
          {sortDir === "asc" ? "A → Z" : "Z → A"}
        </button>
      </div>

      {customers.length === 0 ? (
        <p className="rounded-xl border border-dashed border-orange-200 bg-white p-8 text-center text-sm text-stone-500">
          {search ? "No se encontraron clientes." : "Todavía no cargaste clientes."}
        </p>
      ) : (
        <ul className="space-y-2">
          {customers.map((customer) => (
            <li
              key={customer.id}
              className="flex items-center gap-3 rounded-xl border border-orange-100 bg-white px-4 py-3 shadow-sm"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                <IconUsers className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-stone-900">
                  {customer.firstName} {customer.lastName}
                </p>
                {customer.phone ? (
                  <p className="truncate text-xs text-stone-500">{customer.phone}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => setModalCustomer(customer)}
                  className="inline-flex items-center gap-1 font-medium text-orange-600 hover:underline"
                >
                  <IconPencil className="h-3.5 w-3.5" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(customer)}
                  className="inline-flex items-center gap-1 font-medium text-red-500 hover:underline"
                >
                  <IconTrash className="h-3.5 w-3.5" />
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Fab label="Nuevo cliente" onClick={() => setModalCustomer(null)} />

      {modalCustomer !== undefined ? (
        <CustomerFormModal
          customer={modalCustomer}
          onClose={() => setModalCustomer(undefined)}
          onSaved={async () => {
            setModalCustomer(undefined);
            await refresh();
          }}
        />
      ) : null}
    </div>
  );
}

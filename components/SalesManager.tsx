"use client";

import { useMemo, useState } from "react";
import type { SaleCard as SaleCardData } from "@/lib/types";
import { Fab } from "./Fab";
import { SaleCard } from "./SaleCard";

export function SalesManager({ initialSales }: { initialSales: SaleCardData[] }) {
  const [search, setSearch] = useState("");

  const sales = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = term
      ? initialSales.filter((sale) => sale.customerName.toLowerCase().includes(term))
      : initialSales;

    return [...filtered].sort((a, b) =>
      a.customerName.localeCompare(b.customerName, "es", { sensitivity: "base" }),
    );
  }, [initialSales, search]);

  return (
    <>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar ventas por cliente..."
        className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
      />

      {sales.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-orange-200 bg-white p-8 text-center text-sm text-stone-500">
          {search
            ? "No se encontraron ventas para ese cliente."
            : "Todavía no registraste ninguna venta."}
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {sales.map((sale) => (
            <li key={sale.id}>
              <SaleCard sale={sale} />
            </li>
          ))}
        </ul>
      )}

      <Fab href="/ventas/nueva" label="Nueva venta" />
    </>
  );
}

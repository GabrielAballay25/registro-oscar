"use client";

import { useMemo, useState } from "react";
import type { SaleCard as SaleCardData } from "@/lib/types";
import { Fab } from "./Fab";
import { SaleCard } from "./SaleCard";

/**
 * Sin acentos/mayúsculas, para ordenar y filtrar. No usamos `localeCompare`
 * acá: su resultado depende de los datos de colación ICU del motor JS que
 * lo ejecuta, que pueden diferir entre el servidor (SSR, Node) y el
 * navegador (hidratación), produciendo un orden distinto y un mismatch de
 * hidratación en React. `normalize` + `toLowerCase` + comparación simple
 * son deterministas en cualquier entorno.
 */
function normalizeForSort(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function SalesManager({ initialSales }: { initialSales: SaleCardData[] }) {
  const [search, setSearch] = useState("");

  const sales = useMemo(() => {
    const term = normalizeForSort(search.trim());
    const filtered = term
      ? initialSales.filter((sale) => normalizeForSort(sale.customerName).includes(term))
      : initialSales;

    return [...filtered].sort((a, b) => {
      const an = normalizeForSort(a.customerName);
      const bn = normalizeForSort(b.customerName);
      return an < bn ? -1 : an > bn ? 1 : 0;
    });
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

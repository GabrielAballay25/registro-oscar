"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteSale } from "@/actions/sales";
import { IconTrash } from "./icons";

export function DeleteSaleButton({ saleId, label }: { saleId: string; label: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm(`¿Eliminar la venta de "${label}"? Se borrará también su historial de cobros.`)) {
      return;
    }
    startTransition(async () => {
      const result = await deleteSale(saleId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/ventas");
    });
  }

  return (
    <div className="text-right">
      {error ? <p className="mb-1 text-xs text-red-600">{error}</p> : null}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="inline-flex items-center gap-1 text-sm font-medium text-red-500 hover:underline disabled:opacity-50"
      >
        <IconTrash className="h-3.5 w-3.5" />
        {isPending ? "Eliminando..." : "Eliminar venta"}
      </button>
    </div>
  );
}

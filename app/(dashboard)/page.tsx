import Link from "next/link";
import { getActiveSales } from "@/actions/sales";
import { Fab } from "@/components/Fab";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/money";

export default async function ClientesPage() {
  const sales = await getActiveSales();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <header className="mb-4">
        <h1 className="text-xl font-semibold text-stone-900">Clientes</h1>
        <p className="text-sm text-stone-500">Clientes con saldo pendiente de cobro.</p>
      </header>

      {sales.length === 0 ? (
        <p className="rounded-xl border border-dashed border-orange-200 bg-white p-8 text-center text-sm text-stone-500">
          No hay ventas activas todavía.
        </p>
      ) : (
        <ul className="space-y-2">
          {sales.map((sale) => (
            <li key={sale.id}>
              <Link
                href={`/ventas/${sale.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-orange-100 bg-white px-4 py-3 shadow-sm active:bg-orange-50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-stone-900">{sale.customerName}</p>
                  <p className="truncate text-xs text-stone-500">
                    {new Date(sale.createdAt).toLocaleDateString("es-AR")}
                    {sale.notes ? ` · ${sale.notes}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-stone-900">
                      {formatCurrency(sale.balance)}
                    </p>
                    <p className="text-xs text-stone-500">de {formatCurrency(sale.total)}</p>
                  </div>
                  <StatusBadge status={sale.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Fab href="/ventas/nueva" label="Nueva venta" />
    </div>
  );
}

import Link from "next/link";
import { getActiveSales } from "@/actions/sales";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/money";

export default async function DashboardPage() {
  const sales = await getActiveSales();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Ventas activas</h1>
          <p className="text-sm text-zinc-500">Ventas pendientes o con pagos parciales.</p>
        </div>
        <Link
          href="/ventas/nueva"
          className="shrink-0 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          + Nueva venta
        </Link>
      </header>

      <nav className="mb-6 flex gap-4 text-sm">
        <Link href="/productos" className="text-zinc-600 hover:underline">
          Productos
        </Link>
        <Link href="/cierre" className="text-zinc-600 hover:underline">
          Cierre de caja
        </Link>
      </nav>

      {sales.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
          No hay ventas activas.{" "}
          <Link href="/ventas/nueva" className="underline">
            Registrá la primera
          </Link>
          .
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200">
          {sales.map((sale) => (
            <li key={sale.id}>
              <Link
                href={`/ventas/${sale.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-zinc-50"
              >
                <div>
                  <p className="font-medium text-zinc-900">{sale.customerName}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(sale.createdAt).toLocaleDateString("es-AR")}
                    {sale.notes ? ` · ${sale.notes}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-zinc-900">
                      {formatCurrency(sale.balance)}
                    </p>
                    <p className="text-xs text-zinc-500">de {formatCurrency(sale.total)}</p>
                  </div>
                  <StatusBadge status={sale.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

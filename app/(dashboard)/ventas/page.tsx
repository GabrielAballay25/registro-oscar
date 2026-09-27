import { getSaleCards } from "@/actions/sales";
import { Fab } from "@/components/Fab";
import { SaleCard } from "@/components/SaleCard";

export default async function VentasPage() {
  const sales = await getSaleCards();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <header className="mb-4">
        <h1 className="text-xl font-semibold text-stone-900">Ventas</h1>
        <p className="text-sm text-stone-500">Historial completo, más recientes primero.</p>
      </header>

      {sales.length === 0 ? (
        <p className="rounded-xl border border-dashed border-orange-200 bg-white p-8 text-center text-sm text-stone-500">
          Todavía no registraste ninguna venta.
        </p>
      ) : (
        <ul className="space-y-2">
          {sales.map((sale) => (
            <li key={sale.id}>
              <SaleCard sale={sale} />
            </li>
          ))}
        </ul>
      )}

      <Fab href="/ventas/nueva" label="Nueva venta" />
    </div>
  );
}

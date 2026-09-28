import { listCustomers } from "@/actions/customers";
import { listProducts } from "@/actions/products";
import { getSaleCards } from "@/actions/sales";
import { getWeeklyClosureSummary } from "@/actions/payments";
import { SaleCard } from "@/components/SaleCard";
import { StatCard } from "@/components/StatCard";
import { formatCurrency } from "@/lib/money";

export default async function DashboardPage() {
  const [customers, products, sales, weekSummary] = await Promise.all([
    listCustomers(),
    listProducts(),
    getSaleCards(),
    getWeeklyClosureSummary(),
  ]);

  const activeSales = sales.filter((s) => s.status !== "COMPLETADO");

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6">
      <header>
        <h1 className="text-xl font-semibold text-stone-900">Dashboard</h1>
        <p className="text-sm text-stone-500">Resumen general del negocio.</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Clientes" value={String(customers.length)} href="/clientes" />
        <StatCard label="Productos" value={String(products.length)} href="/productos" />
        <StatCard label="Ventas activas" value={String(activeSales.length)} href="/ventas" />
        <StatCard
          label="Cobrado esta semana"
          value={formatCurrency(weekSummary.total)}
          href="/cobros"
        />
      </div>

      <section>
        <h2 className="mb-2 font-medium text-stone-900">Ventas pendientes</h2>
        {activeSales.length === 0 ? (
          <p className="rounded-xl border border-dashed border-orange-200 bg-white p-6 text-center text-sm text-stone-500">
            No hay ventas pendientes de cobro.
          </p>
        ) : (
          <ul className="space-y-2">
            {activeSales.slice(0, 5).map((sale) => (
              <li key={sale.id}>
                <SaleCard sale={sale} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

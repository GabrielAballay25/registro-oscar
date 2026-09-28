import { listCustomers } from "@/actions/customers";
import { listProducts } from "@/actions/products";
import { getSaleCards } from "@/actions/sales";
import { getWeeklyClosureSummary } from "@/actions/payments";
import { PageHeader } from "@/components/PageHeader";
import { SaleCard } from "@/components/SaleCard";
import { StatCard } from "@/components/StatCard";
import { IconBox, IconCart, IconHome, IconUsers, IconWallet } from "@/components/icons";
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
      <PageHeader title="Dashboard" subtitle="Resumen general del negocio." Icon={IconHome} />

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Clientes"
          value={String(customers.length)}
          href="/clientes"
          Icon={IconUsers}
        />
        <StatCard
          label="Productos"
          value={String(products.length)}
          href="/productos"
          Icon={IconBox}
        />
        <StatCard
          label="Ventas activas"
          value={String(activeSales.length)}
          href="/ventas"
          Icon={IconCart}
        />
        <StatCard
          label="Cobrado esta semana"
          value={formatCurrency(weekSummary.total)}
          href="/cobros"
          Icon={IconWallet}
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

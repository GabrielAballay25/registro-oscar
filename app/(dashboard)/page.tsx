import { listCustomers } from "@/actions/customers";
import { listProducts } from "@/actions/products";
import { getSaleCards } from "@/actions/sales";
import { getWeeklyClosureSummary } from "@/actions/payments";
import { PageHeader } from "@/components/PageHeader";
import { SaleCard } from "@/components/SaleCard";
import { StatCard } from "@/components/StatCard";
import { IconAlert, IconBox, IconCart, IconHome, IconUsers, IconWallet } from "@/components/icons";
import {
  centsToDecimalString,
  decimalToCents,
  formatCurrency,
  multiplyDecimalByInt,
} from "@/lib/money";

export default async function DashboardPage() {
  const [customers, products, sales, weekSummary] = await Promise.all([
    listCustomers(),
    listProducts(),
    getSaleCards(),
    getWeeklyClosureSummary(),
  ]);

  const activeSales = sales.filter((s) => s.status !== "COMPLETADO");

  // Deuda total por cobrar: es un dato distinto del aviso "Saldo a favor /
  // Debe" de cada venta (que mira sólo la cuota vigente por calendario).
  // Acá el usuario quiere saber cuánta plata falta cobrar EN TOTAL por
  // cada venta hasta cancelarla (lo pactado completo: monto por cuota ×
  // cantidad de cuotas, menos lo ya cobrado), sumado entre todas las
  // ventas. Si una venta quedó con saldo a favor, no resta de la deuda de
  // las demás.
  const totalDebtCents = sales.reduce((acc, sale) => {
    const expectedTotal = multiplyDecimalByInt(sale.installmentAmount, sale.installmentCount);
    const remaining = decimalToCents(expectedTotal) - decimalToCents(sale.totalCollected);
    return acc + Math.max(0, remaining);
  }, 0);
  const totalDebt = centsToDecimalString(totalDebtCents);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6">
      <PageHeader title="Inicio" subtitle="Resumen general del negocio." Icon={IconHome} />

      <div className="flex items-center gap-3 rounded-xl border border-orange-100 bg-white p-4 shadow-sm">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
          <IconAlert className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs text-stone-500">Deuda total por cobrar</p>
          <p className="mt-0.5 text-2xl font-bold text-stone-900">{formatCurrency(totalDebt)}</p>
        </div>
      </div>

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

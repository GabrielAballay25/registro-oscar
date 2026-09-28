import { getSaleCards } from "@/actions/sales";
import { Fab } from "@/components/Fab";
import { PageHeader } from "@/components/PageHeader";
import { SaleCard } from "@/components/SaleCard";
import { IconCart } from "@/components/icons";

export default async function VentasPage() {
  const sales = await getSaleCards();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <PageHeader
        title="Ventas"
        subtitle="Historial completo, más recientes primero."
        Icon={IconCart}
      />

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

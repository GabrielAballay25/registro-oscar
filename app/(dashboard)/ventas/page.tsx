import { getSaleCards } from "@/actions/sales";
import { PageHeader } from "@/components/PageHeader";
import { SalesManager } from "@/components/SalesManager";
import { IconCart } from "@/components/icons";

export default async function VentasPage() {
  const sales = await getSaleCards();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <PageHeader
        title="Ventas"
        subtitle="Orden alfabético por cliente. Buscá para filtrar."
        Icon={IconCart}
      />

      <SalesManager initialSales={sales} />
    </div>
  );
}

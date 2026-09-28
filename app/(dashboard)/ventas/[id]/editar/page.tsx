import Link from "next/link";
import { notFound } from "next/navigation";
import { getSaleDetail } from "@/actions/sales";
import { EditSaleForm } from "@/components/EditSaleForm";

export default async function EditSalePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sale = await getSaleDetail(id);
  if (!sale) notFound();

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      <Link href={`/ventas/${id}`} className="text-sm text-stone-500 hover:underline">
        ← Volver
      </Link>
      <h1 className="mb-6 mt-2 text-xl font-semibold text-stone-900">Editar venta</h1>
      <EditSaleForm sale={sale} />
    </div>
  );
}

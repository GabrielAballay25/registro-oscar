import Link from "next/link";
import { listCustomers } from "@/actions/customers";
import { listProducts } from "@/actions/products";
import { NewSaleForm } from "@/components/NewSaleForm";

export default async function NewSalePage() {
  const [customers, products] = await Promise.all([listCustomers(), listProducts()]);

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      <Link href="/ventas" className="text-sm text-stone-500 hover:underline">
        ← Volver
      </Link>
      <h1 className="mb-6 mt-2 text-xl font-semibold text-stone-900">Nueva venta</h1>
      <NewSaleForm customers={customers} products={products} />
    </div>
  );
}

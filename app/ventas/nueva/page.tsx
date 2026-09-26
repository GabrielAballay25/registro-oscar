import Link from "next/link";
import { listProducts } from "@/actions/products";
import { NewSaleForm } from "@/components/NewSaleForm";

export default async function NewSalePage() {
  const products = await listProducts();

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← Volver
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-semibold text-zinc-900">Nueva venta</h1>
      <NewSaleForm products={products} />
    </div>
  );
}

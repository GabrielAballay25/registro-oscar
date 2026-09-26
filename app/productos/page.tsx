import Link from "next/link";
import { listProducts } from "@/actions/products";
import { NewProductForm } from "@/components/NewProductForm";
import { formatCurrency } from "@/lib/money";

export default async function ProductsPage() {
  const products = await listProducts();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-8">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← Volver
      </Link>
      <h1 className="text-2xl font-semibold text-zinc-900">Productos</h1>

      <NewProductForm />

      {products.length === 0 ? (
        <p className="text-sm text-zinc-500">Todavía no cargaste productos.</p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 text-sm">
          {products.map((product) => (
            <li key={product.id} className="flex items-center justify-between px-4 py-3">
              <span className="font-medium text-zinc-900">{product.name}</span>
              <span className="text-zinc-600">
                {formatCurrency(product.price)} · stock: {product.stock}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { listProducts } from "@/actions/products";
import { NewProductForm } from "@/components/NewProductForm";
import { formatCurrency } from "@/lib/money";

export default async function ProductsPage() {
  const products = await listProducts();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-6">
      <header>
        <h1 className="text-xl font-semibold text-stone-900">Productos</h1>
        <p className="text-sm text-stone-500">Catálogo y stock disponible.</p>
      </header>

      <NewProductForm />

      {products.length === 0 ? (
        <p className="rounded-xl border border-dashed border-orange-200 bg-white p-8 text-center text-sm text-stone-500">
          Todavía no cargaste productos.
        </p>
      ) : (
        <ul className="space-y-2">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-orange-100 bg-white px-4 py-3 shadow-sm"
            >
              <span className="font-medium text-stone-900">{product.name}</span>
              <span className="text-sm text-stone-600">
                {formatCurrency(product.price)} · stock: {product.stock}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

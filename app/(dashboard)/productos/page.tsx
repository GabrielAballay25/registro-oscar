import { listProducts } from "@/actions/products";
import { NewProductForm } from "@/components/NewProductForm";

export default async function ProductsPage() {
  const products = await listProducts();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <header className="mb-4">
        <h1 className="text-xl font-semibold text-stone-900">Productos</h1>
        <p className="text-sm text-stone-500">Catálogo y stock disponible.</p>
      </header>

      {products.length === 0 ? (
        <p className="rounded-xl border border-dashed border-orange-200 bg-white p-8 text-center text-sm text-stone-500">
          Todavía no cargaste productos.
        </p>
      ) : (
        <ul className="space-y-2">
          {products.map((product) => (
            <li
              key={product.id}
              className="rounded-xl border border-orange-100 bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium text-stone-900">{product.name}</span>
                <span className="text-sm text-stone-600">stock: {product.stock}</span>
              </div>
              {product.description ? (
                <p className="mt-1 text-xs text-stone-500">{product.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <NewProductForm />
    </div>
  );
}

import { listProducts } from "@/actions/products";
import { ProductsManager } from "@/components/ProductsManager";

export default async function ProductsPage() {
  const products = await listProducts();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <header className="mb-4">
        <h1 className="text-xl font-semibold text-stone-900">Productos</h1>
        <p className="text-sm text-stone-500">Catálogo y stock disponible.</p>
      </header>

      <ProductsManager initialProducts={products} />
    </div>
  );
}

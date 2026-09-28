import { listProducts } from "@/actions/products";
import { PageHeader } from "@/components/PageHeader";
import { ProductsManager } from "@/components/ProductsManager";
import { IconBox } from "@/components/icons";

export default async function ProductsPage() {
  const products = await listProducts();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <PageHeader title="Productos" subtitle="Catálogo y stock disponible." Icon={IconBox} />

      <ProductsManager initialProducts={products} />
    </div>
  );
}

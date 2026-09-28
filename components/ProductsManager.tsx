"use client";

import { useState } from "react";
import { deleteProduct, listProducts } from "@/actions/products";
import type { ProductOption } from "@/lib/types";
import { Fab } from "./Fab";
import { ProductFormModal } from "./ProductFormModal";

export function ProductsManager({ initialProducts }: { initialProducts: ProductOption[] }) {
  const [products, setProducts] = useState(initialProducts);
  // undefined = cerrado, null = alta, un registro = edición
  const [modalProduct, setModalProduct] = useState<ProductOption | null | undefined>(undefined);

  async function refresh() {
    setProducts(await listProducts());
  }

  async function handleDelete(product: ProductOption) {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;
    const result = await deleteProduct(product.id);
    if (!result.success) {
      alert(result.error);
      return;
    }
    await refresh();
  }

  return (
    <>
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
              <div className="mt-2 flex gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => setModalProduct(product)}
                  className="font-medium text-orange-600 hover:underline"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(product)}
                  className="font-medium text-red-500 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Fab label="Nuevo producto" onClick={() => setModalProduct(null)} />

      {modalProduct !== undefined ? (
        <ProductFormModal
          product={modalProduct}
          onClose={() => setModalProduct(undefined)}
          onSaved={async () => {
            setModalProduct(undefined);
            await refresh();
          }}
        />
      ) : null}
    </>
  );
}

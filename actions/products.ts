"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import type { ActionResult, ProductOption } from "@/lib/types";

export async function listProducts(): Promise<ProductOption[]> {
  return db.orm.public.Product
    .select("id", "name", "description", "stock")
    .orderBy((p) => p.name.asc())
    .all();
}

export type ProductInput = {
  name: string;
  description?: string;
  stock: number;
};

function validateProductInput(input: ProductInput): string | null {
  if (!input.name.trim()) return "El nombre del producto es obligatorio.";
  if (!Number.isInteger(input.stock) || input.stock < 0) {
    return "El stock debe ser un número entero mayor o igual a 0.";
  }
  return null;
}

export async function createProduct(
  input: ProductInput,
): Promise<ActionResult<ProductOption>> {
  await requireAuth();

  const error = validateProductInput(input);
  if (error) return { success: false, error };

  const product = await db.orm.public.Product
    .select("id", "name", "description", "stock")
    .create({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      stock: input.stock,
    });

  revalidatePath("/");
  revalidatePath("/productos");
  revalidatePath("/ventas/nueva");

  return { success: true, data: product };
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<ActionResult<ProductOption>> {
  await requireAuth();

  const error = validateProductInput(input);
  if (error) return { success: false, error };

  const product = await db.orm.public.Product.where({ id })
    .select("id", "name", "description", "stock")
    .update({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      stock: input.stock,
    });

  if (!product) return { success: false, error: "El producto no existe." };

  revalidatePath("/");
  revalidatePath("/productos");
  revalidatePath("/ventas/nueva");

  return { success: true, data: product };
}

export async function deleteProduct(id: string): Promise<ActionResult<null>> {
  await requireAuth();

  const salesCount = await db.orm.public.Sale
    .where({ productId: id })
    .aggregate((a) => ({ count: a.count() }));

  if (salesCount.count > 0) {
    return {
      success: false,
      error: "No se puede eliminar: el producto tiene ventas registradas.",
    };
  }

  await db.orm.public.Product.where({ id }).delete();

  revalidatePath("/");
  revalidatePath("/productos");
  revalidatePath("/ventas/nueva");

  return { success: true, data: null };
}

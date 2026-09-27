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

export type CreateProductInput = {
  name: string;
  description?: string;
  stock: number;
};

export async function createProduct(
  input: CreateProductInput,
): Promise<ActionResult<ProductOption>> {
  await requireAuth();

  const name = input.name.trim();
  if (!name) {
    return { success: false, error: "El nombre del producto es obligatorio." };
  }

  if (!Number.isInteger(input.stock) || input.stock < 0) {
    return { success: false, error: "El stock debe ser un número entero mayor o igual a 0." };
  }

  const product = await db.orm.public.Product
    .select("id", "name", "description", "stock")
    .create({
      name,
      description: input.description?.trim() || null,
      stock: input.stock,
    });

  revalidatePath("/productos");
  revalidatePath("/ventas/nueva");

  return { success: true, data: product };
}

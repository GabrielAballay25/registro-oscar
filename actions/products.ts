"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { toMoney } from "@/lib/money";
import type { ActionResult, ProductOption } from "@/lib/types";

export async function listProducts(): Promise<ProductOption[]> {
  return db.orm.public.Product
    .select("id", "name", "price", "stock")
    .orderBy((p) => p.name.asc())
    .all();
}

export async function createProduct(input: {
  name: string;
  description?: string;
  price: string;
  stock: number;
}): Promise<ActionResult<ProductOption>> {
  const name = input.name.trim();
  if (!name) {
    return { success: false, error: "El nombre del producto es obligatorio." };
  }

  const priceValue = Number(input.price);
  if (!Number.isFinite(priceValue) || priceValue < 0) {
    return { success: false, error: "El precio ingresado no es válido." };
  }

  if (!Number.isInteger(input.stock) || input.stock < 0) {
    return { success: false, error: "El stock debe ser un número entero mayor o igual a 0." };
  }

  const product = await db.orm.public.Product
    .select("id", "name", "price", "stock")
    .create({
      name,
      description: input.description?.trim() || null,
      price: toMoney(input.price),
      stock: input.stock,
    });

  revalidatePath("/productos");
  revalidatePath("/ventas/nueva");

  return { success: true, data: product };
}

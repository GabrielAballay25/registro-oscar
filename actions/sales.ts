"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import {
  multiplyDecimalByInt,
  subtractDecimalStrings,
  sumDecimalStrings,
} from "@/lib/money";
import { plainDateTimeToDate } from "@/lib/temporal";
import type {
  ActionResult,
  SaleDetail,
  SaleItemDetail,
  SaleListItem,
} from "@/lib/types";

function toSaleListItem(sale: {
  id: string;
  customerName: string;
  notes: string | null;
  status: string;
  createdAt: Temporal.PlainDateTime;
  items: Array<{ unitPrice: string; quantity: number }>;
  payments: Array<{ amountPaid: string }>;
}): SaleListItem {
  const total = sumDecimalStrings(
    sale.items.map((item) => multiplyDecimalByInt(item.unitPrice, item.quantity)),
  );
  const paid = sumDecimalStrings(sale.payments.map((p) => p.amountPaid));

  return {
    id: sale.id,
    customerName: sale.customerName,
    notes: sale.notes,
    status: sale.status,
    createdAt: plainDateTimeToDate(sale.createdAt).toISOString(),
    total,
    paid,
    balance: subtractDecimalStrings(total, paid),
  };
}

export async function getActiveSales(): Promise<SaleListItem[]> {
  const sales = await db.orm.public.Sale
    .where((s) => s.status.neq("COMPLETADO"))
    .orderBy((s) => s.createdAt.desc())
    .include("items", (items) => items.select("quantity", "unitPrice"))
    .include("payments", (payments) => payments.select("amountPaid"))
    .all();

  return sales.map(toSaleListItem);
}

export async function getAllSales(): Promise<SaleListItem[]> {
  const sales = await db.orm.public.Sale
    .orderBy((s) => s.createdAt.desc())
    .limit(100)
    .include("items", (items) => items.select("quantity", "unitPrice"))
    .include("payments", (payments) => payments.select("amountPaid"))
    .all();

  return sales.map(toSaleListItem);
}

export async function getSaleDetail(saleId: string): Promise<SaleDetail | null> {
  const sale = await db.orm.public.Sale
    .where({ id: saleId })
    .include("items", (items) => items)
    .include("payments", (payments) => payments.orderBy((p) => p.paymentDate.desc()))
    .first();

  if (!sale) return null;

  const productIds = [...new Set(sale.items.map((item) => item.productId))];
  const products = productIds.length
    ? await db.orm.public.Product
        .where((p) => p.id.in(productIds))
        .select("id", "name")
        .all()
    : [];
  const productNameById = new Map(products.map((p) => [p.id, p.name]));

  const items: SaleItemDetail[] = sale.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    productName: productNameById.get(item.productId) ?? "Producto",
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    subtotal: multiplyDecimalByInt(item.unitPrice, item.quantity),
  }));

  const total = sumDecimalStrings(items.map((item) => item.subtotal));
  const paid = sumDecimalStrings(sale.payments.map((p) => p.amountPaid));

  return {
    id: sale.id,
    customerName: sale.customerName,
    notes: sale.notes,
    status: sale.status,
    createdAt: plainDateTimeToDate(sale.createdAt).toISOString(),
    items,
    payments: sale.payments.map((p) => ({
      id: p.id,
      amountPaid: p.amountPaid,
      paymentDate: plainDateTimeToDate(p.paymentDate).toISOString(),
      paymentMethod: p.paymentMethod,
      note: p.note,
      createdAt: plainDateTimeToDate(p.createdAt).toISOString(),
    })),
    total,
    paid,
    balance: subtractDecimalStrings(total, paid),
  };
}

export type CreateSaleInput = {
  customerName: string;
  notes?: string;
  items: Array<{ productId: string; quantity: number }>;
};

export async function createSale(
  input: CreateSaleInput,
): Promise<ActionResult<{ id: string }>> {
  await requireAuth();

  const customerName = input.customerName.trim();
  if (!customerName) {
    return { success: false, error: "El nombre del cliente es obligatorio." };
  }

  const items = input.items.filter((item) => item.quantity > 0);
  if (items.length === 0) {
    return { success: false, error: "Agregá al menos un producto a la venta." };
  }

  try {
    const saleId = await db.transaction(async (tx) => {
      const sale = await tx.orm.public.Sale.create({
        customerName,
        notes: input.notes?.trim() || null,
      });

      for (const item of items) {
        const product = await tx.orm.public.Product.first({ id: item.productId });
        if (!product) {
          throw new Error("Uno de los productos seleccionados ya no existe.");
        }
        if (product.stock < item.quantity) {
          throw new Error(
            `Stock insuficiente para "${product.name}" (disponible: ${product.stock}).`,
          );
        }

        await tx.orm.public.SaleItem.create({
          saleId: sale.id,
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price,
        });

        await tx.orm.public.Product
          .where({ id: product.id })
          .update({ stock: product.stock - item.quantity });
      }

      return sale.id;
    });

    revalidatePath("/");
    revalidatePath("/ventas");
    revalidatePath("/productos");
    revalidatePath("/ventas/nueva");

    return { success: true, data: { id: saleId } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "No se pudo registrar la venta.",
    };
  }
}

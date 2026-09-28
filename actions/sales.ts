"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { sumDecimalStrings, toMoney } from "@/lib/money";
import { dateInputToPlainDateTime, getWeekRange, plainDateTimeToDate } from "@/lib/temporal";
import type {
  ActionResult,
  PaymentDetail,
  PaymentFrequency,
  SaleCard,
  SaleDetail,
} from "@/lib/types";

type RawPayment = { id: string; amountPaid: string; paymentDate: Temporal.PlainDateTime };

type RawSale = {
  id: string;
  customerId: string;
  productId: string;
  quantity: number;
  saleDate: Temporal.PlainDateTime;
  installmentAmount: string;
  paymentFrequency: string;
  firstDueDate: Temporal.PlainDateTime;
  installmentCount: number;
  notes: string | null;
};

function toSaleCard(
  sale: RawSale,
  customerName: string,
  productName: string,
  payments: RawPayment[],
): SaleCard {
  const paidInstallments = payments.length;
  const totalCollected = sumDecimalStrings(payments.map((p) => p.amountPaid));
  const status =
    paidInstallments === 0
      ? "PENDIENTE"
      : paidInstallments >= sale.installmentCount
        ? "COMPLETADO"
        : "PARCIAL";

  let closedAt: string | null = null;
  let closedThisWeek = false;

  if (status === "COMPLETADO" && payments.length > 0) {
    const lastPayment = payments.reduce((latest, p) =>
      plainDateTimeToDate(p.paymentDate) > plainDateTimeToDate(latest.paymentDate) ? p : latest,
    );
    const closedDate = plainDateTimeToDate(lastPayment.paymentDate);
    closedAt = closedDate.toISOString();
    const { startDate, endDate } = getWeekRange(new Date());
    closedThisWeek = closedDate >= startDate && closedDate <= endDate;
  }

  return {
    id: sale.id,
    customerId: sale.customerId,
    customerName,
    productId: sale.productId,
    productName,
    quantity: sale.quantity,
    saleDate: plainDateTimeToDate(sale.saleDate).toISOString(),
    installmentAmount: sale.installmentAmount,
    paymentFrequency: sale.paymentFrequency as PaymentFrequency,
    installmentCount: sale.installmentCount,
    paidInstallments,
    totalCollected,
    status,
    closedAt,
    closedThisWeek,
  };
}

async function nameMaps(customerIds: string[], productIds: string[]) {
  const uniqueCustomerIds = [...new Set(customerIds)];
  const uniqueProductIds = [...new Set(productIds)];

  const [customers, products] = await Promise.all([
    uniqueCustomerIds.length
      ? db.orm.public.Customer
          .where((c) => c.id.in(uniqueCustomerIds))
          .select("id", "firstName", "lastName")
          .all()
      : Promise.resolve([]),
    uniqueProductIds.length
      ? db.orm.public.Product.where((p) => p.id.in(uniqueProductIds)).select("id", "name").all()
      : Promise.resolve([]),
  ]);

  return {
    customerNameById: new Map(customers.map((c) => [c.id, `${c.firstName} ${c.lastName}`])),
    productNameById: new Map(products.map((p) => [p.id, p.name])),
  };
}

export async function getSaleCards(): Promise<SaleCard[]> {
  const sales = await db.orm.public.Sale
    .orderBy((s) => s.createdAt.desc())
    .include("payments", (p) => p.select("id", "amountPaid", "paymentDate"))
    .all();

  const { customerNameById, productNameById } = await nameMaps(
    sales.map((s) => s.customerId),
    sales.map((s) => s.productId),
  );

  return sales.map((sale) =>
    toSaleCard(
      sale,
      customerNameById.get(sale.customerId) ?? "Cliente",
      productNameById.get(sale.productId) ?? "Producto",
      sale.payments,
    ),
  );
}

export async function getSaleDetail(saleId: string): Promise<SaleDetail | null> {
  const sale = await db.orm.public.Sale
    .where({ id: saleId })
    .include("payments", (p) => p.orderBy((row) => row.paymentDate.desc()))
    .first();

  if (!sale) return null;

  const { customerNameById, productNameById } = await nameMaps(
    [sale.customerId],
    [sale.productId],
  );

  const card = toSaleCard(
    sale,
    customerNameById.get(sale.customerId) ?? "Cliente",
    productNameById.get(sale.productId) ?? "Producto",
    sale.payments,
  );

  const payments: PaymentDetail[] = sale.payments.map((p) => ({
    id: p.id,
    amountPaid: p.amountPaid,
    paymentDate: plainDateTimeToDate(p.paymentDate).toISOString(),
    paymentMethod: p.paymentMethod,
    note: p.note,
  }));

  return {
    ...card,
    notes: sale.notes,
    firstDueDate: plainDateTimeToDate(sale.firstDueDate).toISOString(),
    payments,
  };
}

export type CreateSaleInput = {
  customerId: string;
  productId: string;
  quantity: number;
  saleDate: string; // "YYYY-MM-DD"
  installmentAmount: string;
  paymentFrequency: PaymentFrequency;
  firstDueDate: string; // "YYYY-MM-DD"
  installmentCount: number;
  notes?: string;
};

const FREQUENCIES: PaymentFrequency[] = ["SEMANAL", "QUINCENAL", "MENSUAL"];

function validateSaleFields(input: {
  quantity: number;
  saleDate: string;
  firstDueDate: string;
  paymentFrequency: PaymentFrequency;
  installmentCount: number;
  installmentAmount: string;
}): string | null {
  if (!Number.isInteger(input.quantity) || input.quantity < 1) {
    return "La cantidad debe ser un número entero mayor a 0.";
  }
  if (!input.saleDate) return "Indicá la fecha de venta.";
  if (!input.firstDueDate) return "Indicá la fecha del primer cobro.";
  if (!FREQUENCIES.includes(input.paymentFrequency)) return "Elegí cada cuánto se cobra.";
  if (!Number.isInteger(input.installmentCount) || input.installmentCount < 1) {
    return "La cantidad de cuotas debe ser al menos 1.";
  }
  const installmentCents = Number(input.installmentAmount);
  if (!Number.isFinite(installmentCents) || installmentCents <= 0) {
    return "El monto por cuota debe ser mayor a cero.";
  }
  return null;
}

export async function createSale(
  input: CreateSaleInput,
): Promise<ActionResult<{ id: string }>> {
  await requireAuth();

  if (!input.customerId) return { success: false, error: "Seleccioná un cliente." };
  if (!input.productId) return { success: false, error: "Seleccioná un producto." };
  const fieldsError = validateSaleFields(input);
  if (fieldsError) return { success: false, error: fieldsError };

  try {
    const saleId = await db.transaction(async (tx) => {
      const customer = await tx.orm.public.Customer.first({ id: input.customerId });
      if (!customer) throw new Error("El cliente seleccionado no existe.");

      const product = await tx.orm.public.Product.first({ id: input.productId });
      if (!product) throw new Error("El producto seleccionado no existe.");
      if (product.stock < input.quantity) {
        throw new Error(
          `Stock insuficiente para "${product.name}" (disponible: ${product.stock}).`,
        );
      }

      const sale = await tx.orm.public.Sale.create({
        customerId: input.customerId,
        productId: input.productId,
        quantity: input.quantity,
        saleDate: dateInputToPlainDateTime(input.saleDate),
        installmentAmount: toMoney(input.installmentAmount),
        paymentFrequency: input.paymentFrequency,
        firstDueDate: dateInputToPlainDateTime(input.firstDueDate),
        installmentCount: input.installmentCount,
        notes: input.notes?.trim() || null,
      });

      await tx.orm.public.Product
        .where({ id: product.id })
        .update({ stock: product.stock - input.quantity });

      return sale.id;
    });

    revalidatePath("/ventas");
    revalidatePath("/productos");

    return { success: true, data: { id: saleId } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "No se pudo registrar la venta.",
    };
  }
}

export type UpdateSaleInput = {
  quantity: number;
  saleDate: string;
  installmentAmount: string;
  paymentFrequency: PaymentFrequency;
  firstDueDate: string;
  installmentCount: number;
  notes?: string;
};

export async function updateSale(
  id: string,
  input: UpdateSaleInput,
): Promise<ActionResult<null>> {
  await requireAuth();

  const fieldsError = validateSaleFields(input);
  if (fieldsError) return { success: false, error: fieldsError };

  try {
    await db.transaction(async (tx) => {
      const sale = await tx.orm.public.Sale
        .where({ id })
        .include("payments", (p) => p)
        .first();
      if (!sale) throw new Error("La venta no existe.");

      if (input.installmentCount < sale.payments.length) {
        throw new Error(
          `No se puede bajar la cantidad de cuotas por debajo de las ya cobradas (${sale.payments.length}).`,
        );
      }

      const product = await tx.orm.public.Product.first({ id: sale.productId });
      if (!product) throw new Error("El producto de esta venta ya no existe.");

      const stockDelta = sale.quantity - input.quantity;
      const newStock = product.stock + stockDelta;
      if (newStock < 0) {
        throw new Error(
          `Stock insuficiente para "${product.name}" (disponible: ${product.stock + sale.quantity}).`,
        );
      }
      if (stockDelta !== 0) {
        await tx.orm.public.Product.where({ id: product.id }).update({ stock: newStock });
      }

      const paidInstallments = sale.payments.length;
      const status =
        paidInstallments === 0
          ? "PENDIENTE"
          : paidInstallments >= input.installmentCount
            ? "COMPLETADO"
            : "PARCIAL";

      await tx.orm.public.Sale.where({ id }).update({
        quantity: input.quantity,
        saleDate: dateInputToPlainDateTime(input.saleDate),
        installmentAmount: toMoney(input.installmentAmount),
        paymentFrequency: input.paymentFrequency,
        firstDueDate: dateInputToPlainDateTime(input.firstDueDate),
        installmentCount: input.installmentCount,
        notes: input.notes?.trim() || null,
        status,
      });
    });

    revalidatePath("/ventas");
    revalidatePath(`/ventas/${id}`);
    revalidatePath("/productos");

    return { success: true, data: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "No se pudo editar la venta.",
    };
  }
}

export async function deleteSale(id: string): Promise<ActionResult<null>> {
  await requireAuth();

  try {
    await db.transaction(async (tx) => {
      const sale = await tx.orm.public.Sale.first({ id });
      if (!sale) throw new Error("La venta no existe.");

      const product = await tx.orm.public.Product.first({ id: sale.productId });
      if (product) {
        await tx.orm.public.Product
          .where({ id: product.id })
          .update({ stock: product.stock + sale.quantity });
      }

      // Cascade elimina los pagos asociados.
      await tx.orm.public.Sale.where({ id }).delete();
    });

    revalidatePath("/ventas");
    revalidatePath("/productos");
    revalidatePath("/cobros");

    return { success: true, data: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "No se pudo eliminar la venta.",
    };
  }
}

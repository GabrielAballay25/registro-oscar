"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import {
  decimalToCents,
  multiplyDecimalByInt,
  subtractDecimalStrings,
  sumDecimalStrings,
  toMoney,
} from "@/lib/money";
import {
  dateInputToPlainDateTime,
  getWeekRange,
  plainDateTimeToDate,
} from "@/lib/temporal";
import type {
  ActionResult,
  ClosureRecord,
  PaymentReceiptData,
  SaleItemDetail,
  WeeklyClosureSummary,
} from "@/lib/types";

export type RegisterPaymentInput = {
  saleId: string;
  amountPaid: string;
  paymentDate: string; // "YYYY-MM-DD"
  paymentMethod: string;
  note?: string;
};

export async function registerPayment(
  input: RegisterPaymentInput,
): Promise<ActionResult<PaymentReceiptData>> {
  await requireAuth();

  const amountCents = decimalToCents(input.amountPaid || "0");
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return { success: false, error: "El monto cobrado debe ser mayor a cero." };
  }
  if (!input.paymentDate) {
    return { success: false, error: "Indicá la fecha del cobro." };
  }

  try {
    const receipt = await db.transaction(async (tx) => {
      const sale = await tx.orm.public.Sale
        .where({ id: input.saleId })
        .include("items", (items) => items)
        .include("payments", (payments) => payments)
        .first();

      if (!sale) throw new Error("La venta no existe.");

      const productIds = [...new Set(sale.items.map((item) => item.productId))];
      const products = productIds.length
        ? await tx.orm.public.Product
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
      const paidBefore = sumDecimalStrings(sale.payments.map((p) => p.amountPaid));
      const paidAfter = sumDecimalStrings([paidBefore, input.amountPaid]);
      const balance = subtractDecimalStrings(total, paidAfter);

      const newStatus =
        decimalToCents(balance) <= 0
          ? "COMPLETADO"
          : decimalToCents(paidAfter) > 0
            ? "PARCIAL"
            : "PENDIENTE";

      const payment = await tx.orm.public.Payment.create({
        saleId: sale.id,
        amountPaid: toMoney(input.amountPaid),
        paymentDate: dateInputToPlainDateTime(input.paymentDate),
        paymentMethod: input.paymentMethod || "Efectivo",
        note: input.note?.trim() || null,
      });

      await tx.orm.public.Sale.where({ id: sale.id }).update({ status: newStatus });

      const data: PaymentReceiptData = {
        paymentId: payment.id,
        customerName: sale.customerName,
        amountPaid: payment.amountPaid,
        paymentDate: plainDateTimeToDate(payment.paymentDate).toISOString(),
        paymentMethod: payment.paymentMethod,
        note: payment.note,
        saleTotal: total,
        totalPaid: paidAfter,
        balance,
        saleStatus: newStatus,
        items,
      };
      return data;
    });

    revalidatePath("/");
    revalidatePath("/ventas");
    revalidatePath(`/ventas/${input.saleId}`);
    revalidatePath("/cobros");

    return { success: true, data: receipt };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "No se pudo registrar el cobro.",
    };
  }
}

export async function getWeeklyClosureSummary(): Promise<WeeklyClosureSummary> {
  const { start, end, startDate, endDate } = getWeekRange(new Date());

  const payments = await db.orm.public.Payment
    .where((p) => p.paymentDate.gte(start))
    .where((p) => p.paymentDate.lte(end))
    .orderBy((p) => p.paymentDate.asc())
    .all();

  const saleIds = [...new Set(payments.map((p) => p.saleId))];
  const sales = saleIds.length
    ? await db.orm.public.Sale
        .where((s) => s.id.in(saleIds))
        .select("id", "customerName")
        .all()
    : [];
  const customerNameBySaleId = new Map(sales.map((s) => [s.id, s.customerName]));

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    total: sumDecimalStrings(payments.map((p) => p.amountPaid)),
    payments: payments.map((p) => ({
      id: p.id,
      saleId: p.saleId,
      customerName: customerNameBySaleId.get(p.saleId) ?? "Cliente",
      amountPaid: p.amountPaid,
      paymentDate: plainDateTimeToDate(p.paymentDate).toISOString(),
      paymentMethod: p.paymentMethod,
    })),
  };
}

export async function closeCurrentWeek(): Promise<ActionResult<ClosureRecord>> {
  await requireAuth();

  const { start, end } = getWeekRange(new Date());

  const existing = await db.orm.public.WeeklyClosure
    .where((c) => c.startDate.eq(start))
    .first();
  if (existing) {
    return { success: false, error: "La semana actual ya fue cerrada." };
  }

  const summary = await getWeeklyClosureSummary();

  const closure = await db.orm.public.WeeklyClosure.create({
    startDate: start,
    endDate: end,
    totalAmount: toMoney(summary.total),
  });

  revalidatePath("/cobros");

  return {
    success: true,
    data: {
      id: closure.id,
      startDate: plainDateTimeToDate(closure.startDate).toISOString(),
      endDate: plainDateTimeToDate(closure.endDate).toISOString(),
      totalAmount: closure.totalAmount,
      closedAt: plainDateTimeToDate(closure.closedAt).toISOString(),
    },
  };
}

export async function getClosureHistory(): Promise<ClosureRecord[]> {
  const closures = await db.orm.public.WeeklyClosure
    .orderBy((c) => c.startDate.desc())
    .limit(12)
    .all();

  return closures.map((c) => ({
    id: c.id,
    startDate: plainDateTimeToDate(c.startDate).toISOString(),
    endDate: plainDateTimeToDate(c.endDate).toISOString(),
    totalAmount: c.totalAmount,
    closedAt: plainDateTimeToDate(c.closedAt).toISOString(),
  }));
}

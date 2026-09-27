"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { decimalToCents, sumDecimalStrings, toMoney } from "@/lib/money";
import { dateInputToPlainDateTime, getWeekRange, plainDateTimeToDate } from "@/lib/temporal";
import type {
  ActionResult,
  ClosureRecord,
  PaymentReceiptData,
  WeeklyClosureSummary,
} from "@/lib/types";

export type RegisterPaymentInput = {
  saleId: string;
  amountPaid: string;
  paymentDate: string; // "YYYY-MM-DD"
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
        .include("payments", (p) => p)
        .first();

      if (!sale) throw new Error("La venta no existe.");
      if (sale.payments.length >= sale.installmentCount) {
        throw new Error("Esta venta ya tiene todas sus cuotas cobradas.");
      }

      const [customer, product] = await Promise.all([
        tx.orm.public.Customer.first({ id: sale.customerId }),
        tx.orm.public.Product.first({ id: sale.productId }),
      ]);

      const payment = await tx.orm.public.Payment.create({
        saleId: sale.id,
        amountPaid: toMoney(input.amountPaid),
        paymentDate: dateInputToPlainDateTime(input.paymentDate),
      });

      const paidInstallments = sale.payments.length + 1;
      const newStatus =
        paidInstallments >= sale.installmentCount ? "COMPLETADO" : "PARCIAL";

      await tx.orm.public.Sale.where({ id: sale.id }).update({ status: newStatus });

      const totalCollected = sumDecimalStrings([
        ...sale.payments.map((p) => p.amountPaid),
        payment.amountPaid,
      ]);

      const data: PaymentReceiptData = {
        paymentId: payment.id,
        customerName: customer ? `${customer.firstName} ${customer.lastName}` : "Cliente",
        productName: product?.name ?? "Producto",
        amountPaid: payment.amountPaid,
        paymentDate: plainDateTimeToDate(payment.paymentDate).toISOString(),
        installmentNumber: paidInstallments,
        installmentCount: sale.installmentCount,
        totalCollected,
        saleStatus: newStatus,
      };
      return data;
    });

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
        .select("id", "customerId", "productId")
        .all()
    : [];

  const customerIds = [...new Set(sales.map((s) => s.customerId))];
  const productIds = [...new Set(sales.map((s) => s.productId))];

  const [customers, products] = await Promise.all([
    customerIds.length
      ? db.orm.public.Customer.where((c) => c.id.in(customerIds)).select("id", "firstName", "lastName").all()
      : Promise.resolve([]),
    productIds.length
      ? db.orm.public.Product.where((p) => p.id.in(productIds)).select("id", "name").all()
      : Promise.resolve([]),
  ]);

  const customerNameById = new Map(customers.map((c) => [c.id, `${c.firstName} ${c.lastName}`]));
  const productNameById = new Map(products.map((p) => [p.id, p.name]));
  const saleById = new Map(sales.map((s) => [s.id, s]));

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    total: sumDecimalStrings(payments.map((p) => p.amountPaid)),
    payments: payments.map((p) => {
      const sale = saleById.get(p.saleId);
      return {
        id: p.id,
        saleId: p.saleId,
        customerName: sale ? (customerNameById.get(sale.customerId) ?? "Cliente") : "Cliente",
        productName: sale ? (productNameById.get(sale.productId) ?? "Producto") : "Producto",
        amountPaid: p.amountPaid,
        paymentDate: plainDateTimeToDate(p.paymentDate).toISOString(),
      };
    }),
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

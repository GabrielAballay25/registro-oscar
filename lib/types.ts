/**
 * DTOs planos (sólo strings/numbers/null) que cruzan el límite servidor↔cliente.
 * Los Server Actions nunca devuelven `Temporal.PlainDateTime` ni objetos de
 * Prisma directamente: siempre se mapean a estos tipos serializables.
 */

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type PaymentFrequency = "SEMANAL" | "QUINCENAL" | "MENSUAL";

export type CustomerRecord = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
};

export type ProductOption = {
  id: string;
  name: string;
  description: string | null;
  stock: number;
};

export type SaleCard = {
  id: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
  saleDate: string;
  installmentAmount: string;
  paymentFrequency: PaymentFrequency;
  installmentCount: number;
  paidInstallments: number;
  totalCollected: string;
  status: string;
  closedAt: string | null;
  closedThisWeek: boolean;
  /**
   * totalCollected - (paidInstallments × installmentAmount). Positivo =
   * saldo a favor del cliente (pagó de más en las cuotas ya marcadas);
   * negativo = todavía debe para completar esas cuotas.
   */
  installmentBalance: string;
};

export type PaymentDetail = {
  id: string;
  amountPaid: string;
  paymentDate: string;
  paymentMethod: string;
  note: string | null;
};

export type SaleDetail = SaleCard & {
  notes: string | null;
  firstDueDate: string;
  payments: PaymentDetail[];
};

export type PaymentReceiptData = {
  paymentId: string;
  customerName: string;
  productName: string;
  amountPaid: string;
  paymentDate: string;
  installmentNumber: number;
  installmentCount: number;
  totalCollected: string;
  saleStatus: string;
};

export type WeeklyClosurePaymentRow = {
  id: string;
  saleId: string;
  customerName: string;
  productName: string;
  amountPaid: string;
  paymentDate: string;
};

export type WeeklyClosureSummary = {
  startDate: string;
  endDate: string;
  total: string;
  payments: WeeklyClosurePaymentRow[];
};

export type ClosureRecord = {
  id: string;
  startDate: string;
  endDate: string;
  totalAmount: string;
  closedAt: string;
};

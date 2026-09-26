/**
 * DTOs planos (sólo strings/numbers/null) que cruzan el límite servidor↔cliente.
 * Los Server Actions nunca devuelven `Temporal.PlainDateTime` ni objetos de
 * Prisma directamente: siempre se mapean a estos tipos serializables.
 */

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type ProductOption = {
  id: string;
  name: string;
  price: string;
  stock: number;
};

export type SaleListItem = {
  id: string;
  customerName: string;
  notes: string | null;
  status: string;
  createdAt: string;
  total: string;
  paid: string;
  balance: string;
};

export type SaleItemDetail = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
};

export type PaymentDetail = {
  id: string;
  amountPaid: string;
  paymentDate: string;
  paymentMethod: string;
  note: string | null;
  createdAt: string;
};

export type SaleDetail = {
  id: string;
  customerName: string;
  notes: string | null;
  status: string;
  createdAt: string;
  items: SaleItemDetail[];
  payments: PaymentDetail[];
  total: string;
  paid: string;
  balance: string;
};

export type PaymentReceiptData = {
  paymentId: string;
  customerName: string;
  amountPaid: string;
  paymentDate: string;
  paymentMethod: string;
  note: string | null;
  saleTotal: string;
  totalPaid: string;
  balance: string;
  saleStatus: string;
  items: SaleItemDetail[];
};

export type WeeklyClosurePaymentRow = {
  id: string;
  saleId: string;
  customerName: string;
  amountPaid: string;
  paymentDate: string;
  paymentMethod: string;
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

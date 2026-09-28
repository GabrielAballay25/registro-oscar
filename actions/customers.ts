"use server";

import { revalidatePath } from "next/cache";
import { or } from "@prisma/orm-postgres/orm-client";
import { db } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import type { ActionResult, CustomerRecord } from "@/lib/types";

export type ListCustomersParams = {
  search?: string;
  sortDir?: "asc" | "desc";
};

export async function listCustomers(
  params: ListCustomersParams = {},
): Promise<CustomerRecord[]> {
  const search = params.search?.trim();
  const sortDir = params.sortDir ?? "asc";

  let query = db.orm.public.Customer.select(
    "id",
    "firstName",
    "lastName",
    "phone",
    "address",
    "notes",
  );

  if (search) {
    const term = `%${search}%`;
    query = query.where((c) => or(c.firstName.ilike(term), c.lastName.ilike(term)));
  }

  const customers = await query
    .orderBy(
      sortDir === "asc"
        ? [(c) => c.lastName.asc(), (c) => c.firstName.asc()]
        : [(c) => c.lastName.desc(), (c) => c.firstName.desc()],
    )
    .all();

  return customers;
}

export type CustomerInput = {
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  notes?: string;
};

function validateCustomerInput(input: CustomerInput): string | null {
  if (!input.firstName.trim()) return "El nombre es obligatorio.";
  if (!input.lastName.trim()) return "El apellido es obligatorio.";
  return null;
}

export async function createCustomer(
  input: CustomerInput,
): Promise<ActionResult<CustomerRecord>> {
  await requireAuth();

  const error = validateCustomerInput(input);
  if (error) return { success: false, error };

  const customer = await db.orm.public.Customer.select(
    "id",
    "firstName",
    "lastName",
    "phone",
    "address",
    "notes",
  ).create({
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    phone: input.phone?.trim() || null,
    address: input.address?.trim() || null,
    notes: input.notes?.trim() || null,
  });

  revalidatePath("/");
  revalidatePath("/clientes");
  revalidatePath("/ventas/nueva");

  return { success: true, data: customer };
}

export async function updateCustomer(
  id: string,
  input: CustomerInput,
): Promise<ActionResult<CustomerRecord>> {
  await requireAuth();

  const error = validateCustomerInput(input);
  if (error) return { success: false, error };

  const existing = await db.orm.public.Customer.first({ id });
  if (!existing) return { success: false, error: "El cliente no existe." };

  const customer = await db.orm.public.Customer.where({ id })
    .select("id", "firstName", "lastName", "phone", "address", "notes")
    .update({
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone?.trim() || null,
      address: input.address?.trim() || null,
      notes: input.notes?.trim() || null,
    });

  if (!customer) return { success: false, error: "El cliente no existe." };

  revalidatePath("/");
  revalidatePath("/clientes");
  revalidatePath("/ventas");

  return { success: true, data: customer };
}

export async function deleteCustomer(id: string): Promise<ActionResult<null>> {
  await requireAuth();

  const salesCount = await db.orm.public.Sale
    .where({ customerId: id })
    .aggregate((a) => ({ count: a.count() }));

  if (salesCount.count > 0) {
    return {
      success: false,
      error: "No se puede eliminar: el cliente tiene ventas registradas.",
    };
  }

  await db.orm.public.Customer.where({ id }).delete();

  revalidatePath("/");
  revalidatePath("/clientes");

  return { success: true, data: null };
}

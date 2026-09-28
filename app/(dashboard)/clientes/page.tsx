import { listCustomers } from "@/actions/customers";
import { CustomersManager } from "@/components/CustomersManager";

export default async function ClientesPage() {
  const customers = await listCustomers();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <header className="mb-4">
        <h1 className="text-xl font-semibold text-stone-900">Clientes</h1>
        <p className="text-sm text-stone-500">Alta, edición y baja de clientes.</p>
      </header>

      <CustomersManager initialCustomers={customers} />
    </div>
  );
}

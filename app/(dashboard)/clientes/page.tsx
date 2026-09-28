import { listCustomers } from "@/actions/customers";
import { CustomersManager } from "@/components/CustomersManager";
import { PageHeader } from "@/components/PageHeader";
import { IconUsers } from "@/components/icons";

export default async function ClientesPage() {
  const customers = await listCustomers();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <PageHeader title="Clientes" subtitle="Alta, edición y baja de clientes." Icon={IconUsers} />

      <CustomersManager initialCustomers={customers} />
    </div>
  );
}

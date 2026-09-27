import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  if (await isAuthenticated()) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-orange-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold text-stone-900">
          Registro de Ventas
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}

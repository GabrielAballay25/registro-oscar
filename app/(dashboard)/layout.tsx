import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { BottomNav } from "@/components/BottomNav";
import { LogoutButton } from "@/components/LogoutButton";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-orange-50">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-orange-100 bg-white/95 px-4 py-3 backdrop-blur print:hidden">
        <span className="text-sm font-semibold text-stone-900">Registro de Ventas</span>
        <LogoutButton />
      </header>

      <main className="flex-1 pb-24">{children}</main>

      <BottomNav />
    </div>
  );
}

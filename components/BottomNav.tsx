"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBox, IconCart, IconHome, IconUsers, IconWallet } from "./icons";

const TABS = [
  { href: "/", label: "Dashboard", Icon: IconHome },
  { href: "/clientes", label: "Clientes", Icon: IconUsers },
  { href: "/productos", label: "Productos", Icon: IconBox },
  { href: "/ventas", label: "Ventas", Icon: IconCart },
  { href: "/cobros", label: "Cobros", Icon: IconWallet },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-orange-100 bg-white/95 backdrop-blur print:hidden">
      <ul className="mx-auto flex max-w-lg items-stretch justify-around pb-[env(safe-area-inset-bottom)]">
        {TABS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                  active ? "text-orange-600" : "text-stone-400 hover:text-stone-600"
                }`}
              >
                <Icon className="h-6 w-6" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

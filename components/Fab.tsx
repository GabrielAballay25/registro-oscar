import Link from "next/link";
import { IconPlus } from "./icons";

export function Fab({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-white shadow-lg shadow-orange-900/20 transition-transform hover:scale-105 hover:bg-orange-700 print:hidden"
    >
      <IconPlus className="h-6 w-6" />
    </Link>
  );
}

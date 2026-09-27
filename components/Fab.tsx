"use client";

import Link from "next/link";
import { IconPlus } from "./icons";

const FAB_CLASS =
  "fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-white shadow-lg shadow-orange-900/20 transition-transform hover:scale-105 hover:bg-orange-700 print:hidden";

export function Fab(
  props: { label: string } & ({ href: string; onClick?: never } | { onClick: () => void; href?: never }),
) {
  if (props.href) {
    return (
      <Link href={props.href} aria-label={props.label} className={FAB_CLASS}>
        <IconPlus className="h-6 w-6" />
      </Link>
    );
  }

  return (
    <button type="button" onClick={props.onClick} aria-label={props.label} className={FAB_CLASS}>
      <IconPlus className="h-6 w-6" />
    </button>
  );
}

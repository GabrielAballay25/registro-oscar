type IconProps = { className?: string };

const common = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export function IconUsers({ className }: IconProps) {
  return (
    <svg className={className} {...common}>
      <path d="M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" />
      <circle cx="9" cy="7" r="3.2" />
      <path d="M21 20v-1a3.8 3.8 0 0 0-2.7-3.65" />
      <path d="M15.2 3.5a3.2 3.2 0 0 1 0 6.15" />
    </svg>
  );
}

export function IconBox({ className }: IconProps) {
  return (
    <svg className={className} {...common}>
      <path d="M21 8.5 12 4 3 8.5l9 4.5 9-4.5Z" />
      <path d="M3 8.5V16l9 4.5 9-4.5V8.5" />
      <path d="M12 13v7.5" />
    </svg>
  );
}

export function IconCart({ className }: IconProps) {
  return (
    <svg className={className} {...common}>
      <circle cx="9.5" cy="20" r="1.4" />
      <circle cx="17.5" cy="20" r="1.4" />
      <path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 7H6" />
    </svg>
  );
}

export function IconWallet({ className }: IconProps) {
  return (
    <svg className={className} {...common}>
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h11A2.5 2.5 0 0 1 19 7.5" />
      <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
      <path d="M16 13.5h2.5a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H16a1.5 1.5 0 0 1 0-3Z" />
    </svg>
  );
}

export function IconHome({ className }: IconProps) {
  return (
    <svg className={className} {...common}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9v10.5a1 1 0 0 0 1 1h4.5v-6h3v6H19a1 1 0 0 0 1-1V9" />
    </svg>
  );
}

export function IconPlus({ className }: IconProps) {
  return (
    <svg className={className} {...common}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconAlert({ className }: IconProps) {
  return (
    <svg className={className} {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <path d="M12 16h.01" />
    </svg>
  );
}

export function IconPencil({ className }: IconProps) {
  return (
    <svg className={className} {...common}>
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      <path d="M14.5 5.5l4 4" />
    </svg>
  );
}

export function IconTrash({ className }: IconProps) {
  return (
    <svg className={className} {...common}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

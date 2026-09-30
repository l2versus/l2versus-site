"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const ICONS: Record<string, ReactNode> = {
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
    </>
  ),
  services: (
    <>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2-2 2.3-2.3Z" />
    </>
  ),
  packs: (
    <>
      <path d="M3 8l9-5 9 5-9 5-9-5Z" />
      <path d="M3 8v8l9 5 9-5V8M12 13v8" />
    </>
  ),
  balance: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4" />
    </>
  ),
  referrals: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20c0-3 2.9-5 6.5-5s6.5 2 6.5 5" />
      <path d="M17 8.5a3 3 0 0 0 0-5.8M18.5 20c0-2.4-1.2-4-3-4.6" />
    </>
  ),
  rankings: (
    <>
      <path d="M8 21h8M12 17v4" />
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />
    </>
  ),
  warehouse: (
    <>
      <path d="M7 8l-4 4 4 4M17 8l4 4-4 4" />
      <path d="M3 12h18" />
    </>
  ),
  history: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5M12 8v4l3 2" />
    </>
  ),
  shop: (
    <>
      <path d="M4 8h16l-1.2 11.2a1 1 0 0 1-1 .8H6.2a1 1 0 0 1-1-.8L4 8Z" />
      <path d="M8.5 8V6a3.5 3.5 0 0 1 7 0v2" />
    </>
  ),
  market: (
    <>
      <circle cx="9.5" cy="20" r="1.4" />
      <circle cx="17.5" cy="20" r="1.4" />
      <path d="M2 3h3l2.2 11.4a1 1 0 0 0 1 .8h8.4a1 1 0 0 0 1-.8L20.5 7H6" />
    </>
  ),
  rmt: (
    <>
      <path d="M3 7h13l-3-3M21 17H8l3 3" />
      <path d="M12 12h4" />
    </>
  ),
  streams: (
    <>
      <rect x="3" y="5" width="18" height="12" rx="1.5" />
      <path d="M10 9l4 2-4 2V9ZM8 21h8" />
    </>
  ),
};

export type NavItem = { slug: string; href: string; label: string };

export default function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    // Mobile: grade de chips (tudo visível, sem scroll escondido). Desktop: lista vertical.
    <nav className="grid grid-cols-3 gap-1.5 md:flex md:flex-col md:gap-1">
      {items.map((it) => {
        const active =
          pathname === it.href || pathname.startsWith(it.href + "/");
        return (
          <Link
            key={it.slug}
            href={it.href}
            className={`flex flex-col items-center gap-1.5 rounded-sm border px-1.5 py-2.5 text-center text-[0.58rem] uppercase tracking-[0.08em] transition-colors md:flex-row md:gap-3 md:border-0 md:border-l-2 md:px-4 md:py-2.5 md:text-left md:text-xs md:tracking-widest ${
              active
                ? "border-[rgba(201,162,75,0.45)] bg-[rgba(201,162,75,0.1)] text-[var(--color-gold-bright)] md:border-[var(--color-gold)] md:bg-[rgba(201,162,75,0.08)]"
                : "border-[rgba(42,37,48,0.6)] bg-[rgba(18,16,22,0.5)] text-[var(--color-muted)] hover:bg-[rgba(201,162,75,0.05)] hover:text-[var(--color-gold-bright)] md:border-transparent md:bg-transparent"
            }`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 md:h-[17px] md:w-[17px]"
            >
              {ICONS[it.slug]}
            </svg>
            <span className="block w-full truncate leading-tight md:w-auto md:truncate-none">
              {it.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

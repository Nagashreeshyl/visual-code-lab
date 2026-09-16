"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/studio", label: "Studio" },
];

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      {open ? (
        <path fill="currentColor" d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z" />
      ) : (
        <path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
      )}
    </svg>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const onStudio = pathname === "/studio";

  return (
    <header className="fixed top-0 right-0 left-0 z-[10050] h-16 border-b border-charcoal/10 bg-white/90 backdrop-blur md:h-20">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="font-display text-2xl text-charcoal transition-opacity duration-200 hover:opacity-70 md:text-3xl">
          VCL<span className="text-accent">.</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {LINKS.map((link) => {
            const current = link.href === "/studio" && onStudio;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`hover-underline text-sm font-medium transition-colors duration-200 ${
                  current ? "text-charcoal" : "text-charcoal/70 hover:text-charcoal"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <MenuIcon open={open} />
        </button>
      </div>

      {open ? (
        <div className="border-t border-charcoal/10 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center text-base font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

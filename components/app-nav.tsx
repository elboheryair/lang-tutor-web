"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SignOutButton } from "@/components/sign-out-button";

const links = [
  { href: "/dashboard", label: "Home" },
  { href: "/profile", label: "Edit profile" },
] as const;

function NavLink({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-indigo-500/20 text-indigo-200"
          : "text-zinc-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

export function AppNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative border-b border-white/10 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/dashboard"
          className="text-sm font-semibold tracking-wide text-white"
        >
          Lang Tutor
        </Link>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-white/15 p-2 text-zinc-200 lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="app-nav-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">Toggle menu</span>
          <svg
            aria-hidden
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        <nav
          id="app-nav-menu"
          className={`${
            menuOpen ? "flex" : "hidden"
          } absolute left-0 right-0 top-[65px] z-20 flex-col gap-1 border-b border-white/10 bg-zinc-950 px-6 py-4 lg:static lg:flex lg:flex-row lg:items-center lg:gap-2 lg:border-0 lg:bg-transparent lg:p-0`}
        >
          {links.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              onNavigate={() => setMenuOpen(false)}
            />
          ))}
          <div className="mt-2 border-t border-white/10 pt-2 lg:mt-0 lg:border-0 lg:pt-0 lg:pl-2">
            <SignOutButton />
          </div>
        </nav>
      </div>
    </header>
  );
}

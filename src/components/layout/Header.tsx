"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Container } from "./Container";

const navLinks = [
  { href: "/practica", label: "Practică" },
  { href: "/rezultate", label: "Rezultate" },
  { href: "/revizuire", label: "Revizuire" },
  { href: "/despre", label: "Despre" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/80 backdrop-blur-md">
      <Container>
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2 group"
          >
            <span
              className="text-lg font-bold tracking-tight text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Licență UTM
            </span>
            <span className="text-xs font-medium text-[var(--color-accent)] bg-[var(--color-accent-muted)] px-2 py-0.5 rounded-full">
              2026
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors",
                  pathname === link.href || pathname.startsWith(link.href + "/")
                    ? "text-[var(--color-accent)] bg-[var(--color-accent-muted)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/salveaza"
              className={cn(
                "hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors",
                pathname === "/salveaza"
                  ? "text-[var(--color-accent)] bg-[var(--color-accent-muted)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
              )}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Salvează
            </Link>
            <Link
              href="/incarca"
              className={cn(
                "hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors",
                pathname === "/incarca"
                  ? "text-[var(--color-accent)] bg-[var(--color-accent-muted)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
              )}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Încarcă
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </Container>
    </header>
  );
}

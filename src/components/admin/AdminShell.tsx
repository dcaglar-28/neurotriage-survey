import Link from "next/link";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Templates" },
  { href: "/admin/results", label: "Results" },
];

export function AdminShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: "templates" | "results";
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/80 bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-wide">
                NeuroTriage
              </span>
              <span className="text-xs text-muted-foreground">Admin</span>
            </Link>
            <nav className="flex items-center gap-1">
              {links.map((link) => {
                const isActive =
                  (active === "templates" && link.href === "/admin") ||
                  (active === "results" && link.href === "/admin/results");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm transition-colors",
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}

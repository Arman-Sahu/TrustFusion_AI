import { Link } from "@tanstack/react-router";
import { ShieldCheck, Siren, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/url", label: "Links" },
  { to: "/qr", label: "QR codes" },
  { to: "/message", label: "Messages" },
  { to: "/impersonation", label: "Impersonation" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/history", label: "History" },
  { to: "/tips", label: "Tips" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
            <ShieldCheck className="h-6 w-6 text-primary" /> CyberGuard
          </Link>
          <nav className="hidden flex-1 items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground bg-secondary" }}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="emergency" size="sm">
              <Link to="/scammed"><Siren className="h-4 w-4" /> <span className="hidden sm:inline">I think I got scammed</span><span className="sm:hidden">Help</span></Link>
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {open && (
          <nav className="grid gap-1 border-t border-border px-4 py-3 lg:hidden">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
                {n.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/60 py-8 text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4">
          <p>CyberGuard checks content locally on our servers and never opens suspicious links.</p>
          <div className="flex gap-4">
            <Link to="/overview" className="hover:text-foreground">Security overview</Link>
            <Link to="/tips" className="hover:text-foreground">Safety tips</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

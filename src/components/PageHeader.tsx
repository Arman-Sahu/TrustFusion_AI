import type { ReactNode } from "react";

export function PageHeader({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">{icon}</div>
      <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>
    </div>
  );
}

export function SaveToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-primary" />
      Save the original text in my history (off by default for privacy)
    </label>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">{children}</div>;
}

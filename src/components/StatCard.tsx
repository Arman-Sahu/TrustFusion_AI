export function StatCard({ label, value, tone }: { label: string; value: number | string; tone?: string }) {
  return (
    <div className="glass rounded-xl p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-3xl font-bold ${tone ?? ""}`}>{value}</p>
    </div>
  );
}


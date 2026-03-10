export default function BillingPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your subscription and usage
        </p>
      </div>

      {/* TODO: Phase 6 — Plan comparison, usage stats, upgrade link */}
      <div className="flex items-center justify-center h-[40vh] rounded-xl border border-dashed border-border">
        <p className="text-muted-foreground text-sm">
          Billing management coming soon.
        </p>
      </div>
    </div>
  );
}

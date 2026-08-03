import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function PlaceholderPage({
  title,
  description,
  activeTab,
  badge,
}: {
  title: string;
  description: string;
  activeTab: string;
  badge: string;
}) {
  return (
    <DashboardLayout activeTab={activeTab}>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 rounded-lg border border-border bg-card p-8">
        <div className="flex items-center gap-3">
          <span className="rounded border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.25em] text-primary">
            {badge}
          </span>
          <h1 className="text-2xl font-semibold text-white">{title}</h1>
        </div>
        <p className="text-sm leading-6 text-zinc-400">{description}</p>
        <div className="rounded border border-dashed border-border bg-background/70 p-4 text-sm text-zinc-500">
          This screen is wired to the existing route structure so navigation stays consistent while the underlying feature is completed.
        </div>
      </div>
    </DashboardLayout>
  );
}

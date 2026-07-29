import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string | number;
    label: string;
    positive?: boolean;
  };
  icon?: ReactNode;
  loading?: boolean;
}

export function StatCard({ title, value, trend, icon, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-card border border-border p-6 animate-pulse">
        <div className="h-4 w-24 bg-zinc-800 mb-4" />
        <div className="h-8 w-32 bg-zinc-800" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border p-6 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-mono text-xs uppercase text-zinc-400 tracking-wider">{title}</h3>
        {icon && <div className="text-zinc-500 group-hover:text-primary transition-colors">{icon}</div>}
      </div>
      
      <div className="text-3xl font-bold font-mono text-white mb-2">{value}</div>
      
      {trend && (
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className={`${trend.positive ? 'text-primary' : 'text-destructive'}`}>
            {trend.positive ? '+' : '-'}{trend.value}
          </span>
          <span className="text-zinc-500">{trend.label}</span>
        </div>
      )}
      
      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

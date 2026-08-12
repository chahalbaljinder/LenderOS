import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string | number;
    label: string;
    positive?: boolean;
    neutral?: boolean;
  };
  icon?: ReactNode;
  loading?: boolean;
  variant?: 'default' | 'highlight' | 'subtle';
  action?: ReactNode;
  progress?: {
    value: number;
    max?: number;
    label?: string;
  };
}

export function StatCard({ 
  title, 
  value, 
  subtitle,
  trend, 
  icon, 
  loading, 
  variant = 'default',
  action,
  progress,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-card border border-border p-6 animate-pulse relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        <div className="relative z-10 flex justify-between items-start mb-4">
          <div className="h-4 w-24 bg-zinc-800 rounded" />
          <div className="h-8 w-8 bg-zinc-800 rounded-lg" />
        </div>
        <div className="relative z-10 h-8 w-32 bg-zinc-800 rounded mb-2" />
        {trend && <div className="relative z-10 h-4 w-28 bg-zinc-800 rounded" />}
        {progress && <div className="relative z-10 mt-4 h-2 w-full bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-zinc-700" /></div>}
      </div>
    );
  }

  const baseClasses = "bg-card border border-border p-6 relative overflow-hidden group transition-all duration-300";
  const variantClasses = {
    default: "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
    highlight: "border-primary/30 bg-primary/5 hover:border-primary/20 hover:bg-primary/10",
    subtle: "border-transparent bg-muted/50 hover:bg-muted",
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant])}>
      {/* Subtle animated border accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="relative z-10 flex justify-between items-start mb-4">
        <h3 className="font-mono text-xs uppercase text-zinc-400 tracking-wider max-w-[80%] pr-4">{title}</h3>
        {icon && (
          <div className="flex-shrink-0 p-2 bg-primary/10 border border-primary/20 rounded-lg text-primary group-hover:scale-110 transition-transform">
            {icon}
          </div>
        )}
      </div>
      
      <div className="relative z-10">
        <div className="text-3xl md:text-4xl font-bold font-mono text-white tabular-nums mb-1">{value}</div>
        {subtitle && <div className="text-sm text-zinc-400 font-mono mb-2">{subtitle}</div>}
        
        {progress && (
          <div className="mt-4">
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-zinc-400">{progress.label || 'Progress'}</span>
              <span className="text-white">{progress.value}%</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out" 
                style={{ width: `${Math.min(progress.value, 100)}%` }}
              />
            </div>
          </div>
        )}
        
        {trend && (
          <div className={cn("mt-3 flex items-center gap-2 text-xs font-mono", progress ? "mt-4" : "")}>
            {trend.neutral ? (
              <Minus className="w-3 h-3 text-zinc-500" />
            ) : trend.positive ? (
              <TrendingUp className="w-3 h-3 text-primary" />
            ) : (
              <TrendingDown className="w-3 h-3 text-destructive" />
            )}
            <span className={cn(
              trend.neutral ? "text-zinc-500" : 
              trend.positive ? "text-primary" : "text-destructive"
            )}>
              {trend.positive ? '+' : trend.neutral ? '' : ''}{trend.value}
            </span>
            <span className="text-zinc-500">{trend.label}</span>
          </div>
        )}
        
        {action && (
          <div className="mt-4 pt-4 border-t border-border">
            {action}
          </div>
        )}
      </div>
      
      {/* Decorative corner accents */}
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
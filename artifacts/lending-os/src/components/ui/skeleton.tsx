import * as React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  lines,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'stat-card' | 'table-row';
  width?: string | number;
  height?: string | number;
  lines?: number;
}) {
  const baseStyle = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  if (variant === 'text') {
    return (
      <div
        className={cn('animate-pulse bg-zinc-800 rounded', className)}
        style={baseStyle}
        {...props}
      />
    );
  }

  if (variant === 'circular') {
    return (
      <div
        className={cn('animate-pulse bg-zinc-800 rounded-full', className)}
        style={baseStyle}
        {...props}
      />
    );
  }

  if (variant === 'rectangular') {
    return (
      <div
        className={cn('animate-pulse bg-zinc-800 rounded-lg', className)}
        style={baseStyle}
        {...props}
      />
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn('bg-card border border-border rounded-lg p-6 animate-pulse', className)} {...props}>
        <div className="h-4 w-1/3 bg-zinc-800 rounded mb-4" />
        <div className="h-8 w-1/2 bg-zinc-800 rounded" />
        <div className="h-4 w-1/4 bg-zinc-800 rounded mt-4" />
      </div>
    );
  }

  if (variant === 'stat-card') {
    return (
      <div className={cn('bg-card border border-border p-6 animate-pulse relative overflow-hidden', className)} {...props}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        <div className="relative z-10 flex justify-between items-start mb-4">
          <div className="h-4 w-24 bg-zinc-800 rounded" />
          <div className="h-8 w-8 bg-zinc-800 rounded-lg" />
        </div>
        <div className="relative z-10 h-8 w-32 bg-zinc-800 rounded mb-2" />
        <div className="relative z-10 h-4 w-28 bg-zinc-800 rounded" />
      </div>
    );
  }

  if (variant === 'table-row') {
    const rowLines = lines || 4;
    return (
      <div className={cn('animate-pulse', className)} {...props}>
        <div className="flex gap-4 p-4">
          {Array.from({ length: rowLines }).map((_, i) => (
            <div key={i} className="flex-1 space-y-2">
              <div className="h-3 w-1/3 bg-zinc-800 rounded" />
              <div className="h-4 w-3/4 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('animate-pulse bg-zinc-800 rounded', className)}
      style={baseStyle}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 5, columns = 6, compact = false }: { rows?: number; columns?: number; compact?: boolean }) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="border-b border-border bg-black/50 p-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-20" variant="text" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className={cn('p-4', compact && 'py-2')}>
            <div className="flex gap-4">
              {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-24" variant="text" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 4, variant = 'default' }: { count?: number; variant?: 'default' | 'stat' | 'list' }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        variant === 'stat' ? (
          <Skeleton key={i} variant="stat-card" />
        ) : variant === 'list' ? (
          <Skeleton key={i} variant="card" />
        ) : (
          <Skeleton key={i} variant="rectangular" className="aspect-video" />
        )
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 w-48 bg-zinc-800 rounded" />
        <div className="h-8 w-32 bg-zinc-800 rounded" />
      </div>
      
      <CardGridSkeleton count={4} variant="stat" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Skeleton variant="rectangular" className="bg-card border border-border p-6 h-72 rounded-lg" />
        </div>
        <div>
          <Skeleton variant="rectangular" className="bg-card border border-border p-6 h-72 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
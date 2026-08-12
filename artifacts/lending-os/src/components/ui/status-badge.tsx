import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { CheckCircle, XCircle, AlertCircle, Clock, FileText, DollarSign, ShieldCheck, RefreshCw } from 'lucide-react';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      intent: {
        success: 'bg-primary/10 border-primary/20 text-primary',
        warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
        danger: 'bg-destructive/10 border-destructive/20 text-destructive',
        info: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
        neutral: 'bg-zinc-800 border-zinc-700 text-zinc-400',
        pending: 'bg-primary/10 border-primary/20 text-primary',
        draft: 'bg-zinc-800 border-zinc-700 text-zinc-400',
      },
      size: {
        sm: 'px-2 py-0.5 text-[9px] gap-1',
        md: 'px-2.5 py-1 text-[10px] gap-1.5',
        lg: 'px-3 py-1.5 text-xs gap-2',
      },
      showIcon: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      intent: 'neutral',
      size: 'md',
      showIcon: true,
    },
  }
);

interface StatusConfig {
  label: string;
  intent: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'pending' | 'draft';
  icon: React.ReactNode;
}

const statusConfigs: Record<string, StatusConfig> = {
  // Application statuses
  approved: { label: 'Approved', intent: 'success', icon: <CheckCircle className="w-3 h-3" /> },
  rejected: { label: 'Rejected', intent: 'danger', icon: <XCircle className="w-3 h-3" /> },
  pending: { label: 'Pending', intent: 'pending', icon: <Clock className="w-3 h-3" /> },
  under_review: { label: 'Under Review', intent: 'info', icon: <AlertCircle className="w-3 h-3" /> },
  kyc_pending: { label: 'KYC Pending', intent: 'warning', icon: <ShieldCheck className="w-3 h-3" /> },
  draft: { label: 'Draft', intent: 'draft', icon: <FileText className="w-3 h-3" /> },
  disbursed: { label: 'Disbursed', intent: 'success', icon: <DollarSign className="w-3 h-3" /> },
  submitted: { label: 'Submitted', intent: 'pending', icon: <Clock className="w-3 h-3" /> },
  
  // Loan statuses
  active: { label: 'Active', intent: 'success', icon: <CheckCircle className="w-3 h-3" /> },
  closed: { label: 'Closed', intent: 'neutral', icon: <CheckCircle className="w-3 h-3" /> },
  defaulted: { label: 'Defaulted', intent: 'danger', icon: <XCircle className="w-3 h-3" /> },
  restructured: { label: 'Restructured', intent: 'warning', icon: <RefreshCw className="w-3 h-3" /> },
  npa: { label: 'NPA', intent: 'danger', icon: <AlertCircle className="w-3 h-3" /> },
  
  // Collection statuses
  overdue: { label: 'Overdue', intent: 'danger', icon: <AlertCircle className="w-3 h-3" /> },
  critical: { label: 'Critical', intent: 'danger', icon: <XCircle className="w-3 h-3" /> },
  recovering: { label: 'Recovering', intent: 'warning', icon: <RefreshCw className="w-3 h-3" /> },
  settled: { label: 'Settled', intent: 'success', icon: <CheckCircle className="w-3 h-3" /> },
  legal: { label: 'Legal', intent: 'danger', icon: <AlertCircle className="w-3 h-3" /> },
  
  // Tenant statuses
  active_tenant: { label: 'Active', intent: 'success', icon: <CheckCircle className="w-3 h-3" /> },
  suspended: { label: 'Suspended', intent: 'danger', icon: <XCircle className="w-3 h-3" /> },
  pending_tenant: { label: 'Pending', intent: 'pending', icon: <Clock className="w-3 h-3" /> },
  
  // Customer statuses
  verified: { label: 'Verified', intent: 'success', icon: <ShieldCheck className="w-3 h-3" /> },
  kyc_incomplete: { label: 'KYC Incomplete', intent: 'warning', icon: <AlertCircle className="w-3 h-3" /> },
  onboarding: { label: 'Onboarding', intent: 'pending', icon: <Clock className="w-3 h-3" /> },
  
  // Product statuses
  active_product: { label: 'Active', intent: 'success', icon: <CheckCircle className="w-3 h-3" /> },
  inactive: { label: 'Inactive', intent: 'neutral', icon: <XCircle className="w-3 h-3" /> },
  archived: { label: 'Archived', intent: 'neutral', icon: <FileText className="w-3 h-3" /> },
};

export interface StatusBadgeProps 
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  status?: string;
  label?: string;
  intent?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'pending' | 'draft';
  icon?: React.ReactNode;
}

export function StatusBadge({ 
  status, 
  label, 
  intent, 
  icon, 
  showIcon = true,
  className,
  size = 'md',
  ...props 
}: StatusBadgeProps) {
  const config = status ? statusConfigs[status] : null;
  
  const displayLabel = label || config?.label || status || 'Unknown';
  const displayIntent = intent || config?.intent || 'neutral';
  const displayIcon = showIcon ? (icon || config?.icon) : null;

  return (
    <span 
      className={cn(badgeVariants({ intent: displayIntent, size, showIcon }), className)}
      {...props}
    >
      {displayIcon}
      {displayLabel}
    </span>
  );
}

export { statusConfigs };
export type { StatusConfig };
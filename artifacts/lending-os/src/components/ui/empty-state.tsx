import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Plus, 
  Filter, 
  FileText, 
  Users, 
  CreditCard, 
  Shield, 
  Database, 
  Mail, 
  Bell, 
  Inbox,
  ClipboardList,
  Settings,
  Building2,
  BarChart2,
} from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  illustration?: 'search' | 'filter' | 'add' | 'data' | 'connection';
}

const illustrations: Record<string, React.ReactNode> = {
  search: (
    <div className="w-20 h-20 mx-auto mb-6 bg-zinc-900/50 border border-zinc-800 rounded-full flex items-center justify-center">
      <Search className="w-10 h-10 text-zinc-500" />
    </div>
  ),
  filter: (
    <div className="w-20 h-20 mx-auto mb-6 bg-zinc-900/50 border border-zinc-800 rounded-full flex items-center justify-center">
      <Filter className="w-10 h-10 text-zinc-500" />
    </div>
  ),
  add: (
    <div className="w-20 h-20 mx-auto mb-6 bg-zinc-900/50 border border-zinc-800 rounded-full flex items-center justify-center">
      <Plus className="w-10 h-10 text-primary" />
    </div>
  ),
  data: (
    <div className="w-24 h-24 mx-auto mb-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex items-center justify-center">
      <Database className="w-12 h-12 text-zinc-500" />
    </div>
  ),
  connection: (
    <div className="w-24 h-24 mx-auto mb-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex items-center justify-center">
      <Shield className="w-12 h-12 text-zinc-500" />
    </div>
  ),
};

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  secondaryAction,
  className, 
  illustration = 'data',
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-16 px-6 bg-card border border-border rounded-xl', className)}>
      {icon || illustrations[illustration]}
      
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 max-w-sm mb-6 leading-relaxed">{description}</p>
      
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || 'default'}
            className="w-full sm:w-auto"
          >
            {action.icon}
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button
            onClick={secondaryAction.onClick}
            variant="ghost"
            className="w-full sm:w-auto"
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}

// Pre-configured empty states for common scenarios
export const EmptyStates = {
  noApplications: {
    illustration: "add" as const,
    title: "No Applications Yet",
    description: "Start by creating your first loan application. The underwriting queue will populate here.",
    action: { label: "Create Application", icon: <Plus className="w-4 h-4" />, onClick: () => {} },
  },
  
  noApplicationsFiltered: (onClear?: () => void) => ({
    illustration: "filter" as const,
    title: "No Matching Applications",
    description: "Try adjusting your filters or search terms to find what you're looking for.",
    action: onClear ? { label: "Clear Filters", variant: "outline" as const, onClick: onClear } : undefined,
  }),
  
  noCustomers: {
    illustration: "add" as const,
    title: "No Customers Yet",
    description: "Customer profiles will appear here once they're created or imported.",
    action: { label: "Add Customer", icon: <Plus className="w-4 h-4" />, onClick: () => {} },
  },
  
  noLoans: {
    illustration: "data" as const,
    title: "No Active Loans",
    description: "Approved and disbursed loans will appear here for portfolio management.",
    action: { label: "View Applications", variant: "outline" as const, onClick: () => {} },
  },
  
  noCollections: {
    illustration: "search" as const,
    title: "No Collection Cases",
    description: "All accounts are current. Overdue accounts will be prioritized here automatically.",
  },
  
  noTenants: {
    illustration: "add" as const,
    title: "No Tenant Environments",
    description: "Deploy your first lender instance to start onboarding customers and processing loans.",
    action: { label: "Create Environment", icon: <Plus className="w-4 h-4" />, onClick: () => {} },
  },
  
  noProducts: {
    illustration: "add" as const,
    title: "No Loan Products",
    description: "Define your lending products with rates, terms, and eligibility criteria.",
    action: { label: "Create Product", icon: <Plus className="w-4 h-4" />, onClick: () => {} },
  },
  
  noAuditLogs: {
    illustration: "data" as const,
    title: "No Audit Logs",
    description: "System events and admin actions will be recorded here for compliance tracking.",
  },
  
  noSettings: {
    illustration: "connection" as const,
    title: "Configuration Required",
    description: "Set up your tenant preferences, workflows, and notification channels.",
    action: { label: "Open Settings", icon: <Settings className="w-4 h-4" />, onClick: () => {} },
  },
  
  noSearchResults: (query: string, onClear?: () => void) => ({
    illustration: "search" as const,
    title: "No Results Found",
    description: `No matches for "${query}". Try a different search term.`,
    action: onClear ? { label: "Clear Search", variant: "outline" as const, onClick: onClear } : undefined,
  }),
  
  noNotifications: {
    illustration: "data" as const,
    title: "No Notifications",
    description: "You're all caught up. New alerts will appear here.",
  },
  
  noPermissions: {
    illustration: "connection" as const,
    title: "Access Restricted",
    description: "You don't have permission to view this resource. Contact your administrator.",
  },
  
  loading: (message = "Loading...") => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-mono text-sm text-primary">{message}</p>
    </div>
  ),
  
  error: (message: string, onRetry?: () => void) => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-card border border-destructive/30 rounded-xl">
      <div className="w-12 h-12 bg-destructive/10 border border-destructive/20 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
      <p className="text-sm text-zinc-400 mb-6 max-w-sm">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="default">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  ),
};

import { AlertCircle, RefreshCw } from 'lucide-react';
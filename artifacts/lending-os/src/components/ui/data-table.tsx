'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableFooter, 
  TableRow, 
  TableHead, 
  TableCell, 
  TableCaption 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

export interface Column<T> {
  key: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  hideOnMobile?: boolean;
  cellClassName?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  
  // Pagination
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: number[];
  };
  
  // Selection
  selection?: {
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    getRowId: (row: T) => string;
  };
  
  // Row actions
  rowActions?: {
    label: string;
    onClick: (row: T, event: React.MouseEvent) => void;
    icon?: React.ReactNode;
    variant?: 'default' | 'destructive' | 'outline';
  }[];
  
  // Toolbar
  toolbar?: React.ReactNode;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  
  // Styling
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  
  // Accessibility
  ariaLabel?: string;
  caption?: string;
}

function SortableHeader({ 
  children, 
  sortable, 
  sorted, 
  order, 
  onClick 
}: {
  children: React.ReactNode;
  sortable?: boolean;
  sorted?: boolean;
  order?: 'asc' | 'desc';
  onClick?: () => void;
}) {
  if (!sortable || !onClick) {
    return <>{children}</>;
  }
  
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
      aria-sort={sorted ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      {children}
      {sorted ? (
        order === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
      ) : (
        <span className="w-3 h-3 opacity-0" />
      )}
    </button>
  );
}

function MobileCardView<T>({ 
  columns, 
  data, 
  rowKey, 
  onRowClick, 
  selection, 
  rowActions,
  compact,
}: Pick<DataTableProps<T>, 'columns' | 'data' | 'rowKey' | 'onRowClick' | 'selection' | 'rowActions' | 'compact'>) {
  const visibleColumns = columns.filter(c => !c.hideOnMobile);
  
  return (
    <div className="md:hidden space-y-3" role="list" aria-label="Data cards">
      {data.map((row) => {
        const id = rowKey(row);
        const isSelected = selection?.selectedIds.includes(id);
        
        return (
          <div
            key={id}
            className={cn(
              'bg-card border border-border rounded-lg p-4 transition-colors',
              isSelected && 'border-primary/50 bg-primary/5',
              onRowClick && 'cursor-pointer hover:border-primary/30 hover:bg-muted/50',
              compact && 'p-3'
            )}
            role="listitem"
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            onKeyDown={onRowClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onRowClick(row); } : undefined}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="font-mono text-xs text-zinc-400">{id}</div>
              {selection && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => {
                    const newSelection = checked
                      ? [...selection.selectedIds, id]
                      : selection.selectedIds.filter(s => s !== id);
                    selection.onSelectionChange(newSelection);
                  }}
                  aria-label="Select row"
                />
              )}
            </div>
            
            <div className="space-y-2">
              {visibleColumns.map((col) => (
                <div key={col.key} className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase text-zinc-500">{col.header}</span>
                  <span className="font-medium text-white">{col.accessor(row)}</span>
                </div>
              ))}
            </div>
            
            {rowActions && rowActions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-border">
                {rowActions.map((action, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant={action.variant || 'outline'}
                    onClick={(e) => { e.stopPropagation(); action.onClick(row, e); }}
                    className="flex-1 min-w-[120px]"
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PaginationControls({ 
  page, 
  pageSize, 
  total, 
  onPageChange, 
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}) {
  const totalPages = Math.ceil(total / pageSize);
  const start = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, total);
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border">
      <div className="flex items-center gap-4 text-sm font-mono text-zinc-400">
        <span>Showing {start}–{end} of {total}</span>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-background border border-border px-2 py-1 text-sm font-mono rounded focus:outline-none focus:border-primary"
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>{size} per page</option>
            ))}
          </select>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }
            
            return (
              <Button
                key={pageNum}
                variant={page === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                aria-label={`Page ${pageNum}`}
                aria-current={page === pageNum ? 'page' : undefined}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data available',
  rowKey,
  onRowClick,
  sortBy,
  sortOrder,
  onSort,
  pagination,
  selection,
  rowActions,
  toolbar,
  showSearch = false,
  searchPlaceholder = 'Search...',
  onSearch,
  className,
  striped = true,
  hoverable = true,
  compact = false,
  ariaLabel = 'Data table',
  caption,
}: DataTableProps<T>) {
  const isMobile = useIsMobile();
  const [searchValue, setSearchValue] = React.useState('');
  
  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };
  
  const handleSort = (key: string) => {
    if (!onSort) return;
    const newOrder = sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(key, newOrder);
  };
  
  const visibleColumns = columns.filter(c => !isMobile || !c.hideOnMobile);
  
  // Show mobile card view on small screens
  if (isMobile) {
    return (
      <div className={cn('w-full', className)} role="region" aria-label={ariaLabel}>
        {toolbar && <div className="mb-4">{toolbar}</div>}
        {(showSearch || onSearch) && (
          <div className="mb-4 relative">
            <MoreHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" aria-hidden="true" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4"
              aria-label="Search"
            />
          </div>
        )}
        {isLoading ? (
          <div className="space-y-3" role="status" aria-live="polite">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  {visibleColumns.slice(0, 4).map((col) => (
                    <div key={col.key} className="space-y-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <MoreHorizontal className="w-12 h-12 mx-auto text-zinc-500 mb-4" aria-hidden="true" />
            <p className="font-mono text-sm text-zinc-400 mb-4">{emptyMessage}</p>
          </div>
        ) : (
          <MobileCardView
            columns={columns}
            data={data}
            rowKey={rowKey}
            onRowClick={onRowClick}
            selection={selection}
            rowActions={rowActions}
            compact={compact}
          />
        )}
        {pagination && !isLoading && data.length > 0 && (
          <PaginationControls
            page={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={pagination.onPageChange}
            onPageSizeChange={pagination.onPageSizeChange}
            pageSizeOptions={pagination.pageSizeOptions}
          />
        )}
      </div>
    );
  }
  
  return (
    <div className={cn('w-full overflow-auto', className)} role="region" aria-label={ariaLabel}>
      {toolbar && <div className="mb-4">{toolbar}</div>}
      
      {(showSearch || onSearch) && (
        <div className="mb-4 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <MoreHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" aria-hidden="true" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4"
              aria-label="Search"
            />
          </div>
        </div>
      )}
      
      <Table className={cn(striped && 'striped', hoverable && 'hoverable', compact && 'compact')}>
        {caption && <TableCaption>{caption}</TableCaption>}
        <TableHeader>
          <TableRow>
            {selection && (
              <TableHead className="w-12" scope="col">
                <Checkbox
                  checked={data.length > 0 && selection.selectedIds.length === data.length}
                  onCheckedChange={(checked) => {
                    const newSelection = checked
                      ? data.map(row => rowKey(row))
                      : [];
                    selection.onSelectionChange(newSelection);
                  }}
                  aria-label="Select all rows"
                />
              </TableHead>
            )}
            {visibleColumns.map((col) => (
              <TableHead
                key={col.key}
                scope="col"
                className={cn(
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                  col.headerClassName,
                  compact && 'py-2'
                )}
                style={{ width: col.width }}
              >
                <SortableHeader
                  sortable={col.sortable}
                  sorted={sortBy === col.key}
                  order={sortOrder}
                  onClick={() => handleSort(col.key)}
                >
                  {col.header}
                </SortableHeader>
              </TableHead>
            ))}
            {rowActions && rowActions.length > 0 && (
              <TableHead className="w-48 text-right" scope="col">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={visibleColumns.length + (selection ? 1 : 0) + (rowActions ? 1 : 0)} className="py-8">
                <div className="flex justify-center">
                  <div className="flex gap-2" role="status" aria-live="polite">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="font-mono text-sm text-primary self-center">Loading...</span>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={visibleColumns.length + (selection ? 1 : 0) + (rowActions ? 1 : 0)} 
                className="py-12 text-center"
              >
                <div className="flex flex-col items-center gap-4 text-zinc-500">
                  <MoreHorizontal className="w-10 h-10" aria-hidden="true" />
                  <p className="font-mono text-sm">{emptyMessage}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => {
              const id = rowKey(row);
              const isSelected = selection?.selectedIds.includes(id);
              
              return (
                <TableRow
                  key={id}
                  className={cn(
                    isSelected && 'bg-primary/5',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={onRowClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onRowClick(row); } : undefined}
                  data-selected={isSelected}
                >
                  {selection && (
                    <TableCell className="w-12">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          const newSelection = checked
                            ? [...selection.selectedIds, id]
                            : selection.selectedIds.filter(s => s !== id);
                          selection.onSelectionChange(newSelection);
                        }}
                        aria-label={`Select row ${id}`}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  {visibleColumns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        col.align === 'right' && 'text-right',
                        col.align === 'center' && 'text-center',
                        col.cellClassName,
                        compact && 'py-2'
                      )}
                    >
                      {col.accessor(row)}
                    </TableCell>
                  ))}
                  {rowActions && rowActions.length > 0 && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {rowActions.map((action, i) => (
                          <Button
                            key={i}
                            size="sm"
                            variant={action.variant || 'outline'}
                            onClick={(e) => { e.stopPropagation(); action.onClick(row, e); }}
                          >
                            {action.icon}
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
        {pagination && !isLoading && data.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell 
                colSpan={visibleColumns.length + (selection ? 1 : 0) + (rowActions ? 1 : 0)} 
                className="p-0"
              >
                <PaginationControls
                  page={pagination.page}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onPageChange={pagination.onPageChange}
                  onPageSizeChange={pagination.onPageSizeChange}
                  pageSizeOptions={pagination.pageSizeOptions}
                />
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
}
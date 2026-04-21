'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T extends Record<string, any>> {
  columns: Column<T>[];
  data: T[];
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  onRowClick?: (row: T) => void;
  className?: string;
  rowIdKey?: keyof T;
}

const Table = React.forwardRef<HTMLDivElement, TableProps<any>>(
  ({ columns, data, selectable = false, onSelectionChange, onRowClick, className, rowIdKey = 'id' }, ref) => {
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

    const handleSort = (key: string, sortable?: boolean) => {
      if (!sortable) return;
      let direction: 'asc' | 'desc' = 'asc';
      if (sortConfig?.key === key && sortConfig.direction === 'asc') direction = 'desc';
      setSortConfig({ key, direction });
    };

    const sortedData = [...data].sort((a, b) => {
      if (!sortConfig) return 0;
      const aVal = a[sortConfig.key], bVal = b[sortConfig.key];
      if (aVal === bVal) return 0;
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      return sortConfig.direction === 'asc' ? 1 : -1;
    });

    const handleSelectAll = () => {
      if (selectedRows.size === data.length) {
        setSelectedRows(new Set());
        onSelectionChange?.([]);
      } else {
        const all = new Set(data.map((row) => String(row[rowIdKey])));
        setSelectedRows(all);
        onSelectionChange?.(Array.from(all));
      }
    };

    const handleSelectRow = (id: string) => {
      const next = new Set(selectedRows);
      next.has(id) ? next.delete(id) : next.add(id);
      setSelectedRows(next);
      onSelectionChange?.(Array.from(next));
    };

    return (
      <div ref={ref} className={cn('overflow-x-auto rounded-xl border border-[#f0e4e9]', className)}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#f0e4e9]">
              {selectable && (
                <th className="px-4 py-2.5 text-left w-10">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-accent-500 focus:ring-accent-500/20 cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  onClick={() => handleSort(String(col.key), col.sortable)}
                  className={cn(
                    'px-4 py-2.5 text-left text-xs font-medium text-gray-500',
                    col.sortable && 'cursor-pointer hover:text-gray-700',
                    col.className
                  )}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortConfig?.key === String(col.key) && (
                      <span className="text-accent-500">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, idx) => {
              const rowId = String(row[rowIdKey]);
              const selected = selectedRows.has(rowId);
              return (
                <tr
                  key={rowId || idx}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'border-b border-[#f0e4e9] last:border-0 transition-colors',
                    'hover:bg-gray-50',
                    onRowClick && 'cursor-pointer',
                    selected && 'bg-accent-50/40'
                  )}
                >
                  {selectable && (
                    <td className="px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => handleSelectRow(rowId)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-accent-500 focus:ring-accent-500/20 cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={String(col.key)} className={cn('px-4 py-2.5 text-sm text-gray-700', col.className)}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-gray-400">Nenhum dado disponível</div>
        )}
      </div>
    );
  }
);

Table.displayName = 'Table';

export { Table };
export type { Column, TableProps };

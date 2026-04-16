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
  (
    {
      columns,
      data,
      selectable = false,
      onSelectionChange,
      onRowClick,
      className,
      rowIdKey = 'id',
    },
    ref
  ) => {
    const [sortConfig, setSortConfig] = useState<{
      key: string;
      direction: 'asc' | 'desc';
    } | null>(null);
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

    const handleSort = (key: string, sortable?: boolean) => {
      if (!sortable) return;

      let direction: 'asc' | 'desc' = 'asc';
      if (sortConfig?.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
      }

      setSortConfig({ key, direction });
    };

    const sortedData = [...data].sort((a, b) => {
      if (!sortConfig) return 0;

      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === bValue) return 0;
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      return sortConfig.direction === 'asc' ? 1 : -1;
    });

    const handleSelectAll = () => {
      if (selectedRows.size === data.length) {
        setSelectedRows(new Set());
        onSelectionChange?.([]);
      } else {
        const newSelected = new Set(
          data.map((row) => String(row[rowIdKey]))
        );
        setSelectedRows(newSelected);
        onSelectionChange?.(Array.from(newSelected));
      }
    };

    const handleSelectRow = (id: string) => {
      const newSelected = new Set(selectedRows);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      setSelectedRows(newSelected);
      onSelectionChange?.(Array.from(newSelected));
    };

    return (
      <div
        ref={ref}
        className={cn('overflow-x-auto rounded-lg border border-dark-100', className)}
      >
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-dark-100 bg-dark-400/50">
              {selectable && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border border-dark-100 bg-dark-300 cursor-pointer accent-brand-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  onClick={() => handleSort(String(column.key), column.sortable)}
                  className={cn(
                    'px-4 py-3 text-left text-sm font-semibold text-gray-200',
                    column.sortable && 'cursor-pointer hover:text-gray-50',
                    column.className
                  )}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && sortConfig?.key === String(column.key) && (
                      <span className="text-brand-500">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, idx) => {
              const rowId = String(row[rowIdKey]);
              const isSelected = selectedRows.has(rowId);

              return (
                <tr
                  key={rowId || idx}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'border-b border-dark-100 transition-colors',
                    'hover:bg-dark-300/50 cursor-pointer',
                    isSelected && 'bg-dark-300/70'
                  )}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(rowId)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border border-dark-100 bg-dark-300 cursor-pointer accent-brand-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={cn('px-4 py-3 text-sm text-gray-300', column.className)}
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-400">
            No data available
          </div>
        )}
      </div>
    );
  }
);

Table.displayName = 'Table';

export { Table };
export type { Column, TableProps };

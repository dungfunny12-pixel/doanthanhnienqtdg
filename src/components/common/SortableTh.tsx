import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface SortableThProps {
  label?: string;
  columnKey?: string;
  sortKey?: string;
  currentSortKey: string | null;
  currentSortDir: 'asc' | 'desc';
  onSort: (key: string) => void;
  align?: 'left' | 'center' | 'right';
  className?: string;
  width?: string;
  children?: React.ReactNode;
}

export const SortableTh: React.FC<SortableThProps> = ({
  label,
  columnKey,
  sortKey,
  currentSortKey,
  currentSortDir,
  onSort,
  align = 'left',
  className = '',
  width,
  children
}) => {
  const effectiveKey = sortKey || columnKey || '';
  const isSorted = currentSortKey === effectiveKey;
  const displayLabel = children || label || effectiveKey;

  return (
    <th
      style={width ? { width } : undefined}
      onClick={() => onSort(effectiveKey)}
      className={`p-2.5 font-bold select-none cursor-pointer group transition-colors hover:bg-slate-800/80 hover:text-white ${
        align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
      } ${className}`}
      title={`Nhấp để sắp xếp (${isSorted ? (currentSortDir === 'asc' ? 'Z-A' : 'A-Z') : 'A-Z'})`}
    >
      <div
        className={`inline-flex items-center gap-1 ${
          align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'
        }`}
      >
        <span>{displayLabel}</span>
        <span
          className={`transition-transform duration-200 ${
            isSorted ? 'text-amber-400 font-extrabold scale-110' : 'text-slate-600 group-hover:text-slate-400'
          }`}
        >
          {isSorted ? (
            currentSortDir === 'asc' ? (
              <ArrowUp className="w-3.5 h-3.5 inline" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5 inline" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3 inline opacity-60" />
          )}
        </span>
      </div>
    </th>
  );
};

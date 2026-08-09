'use client';

import React from 'react';
import { Button } from './Button';

interface PaginationProps {
  /** Current page (0-indexed). */
  page: number;
  /** Total number of pages (>= 1). */
  totalPages: number;
  /** Total number of items, used for the "Mostrando X–Y de Z" label. */
  totalItems: number;
  /** Items per page, used for the "Mostrando X–Y" label. */
  pageSize: number;
  /** Called with the new page (0-indexed) when the user clicks a control. */
  onPageChange: (page: number) => void;
  /** Optional extra classes. */
  className?: string;
}

const SIBLING_COUNT = 1;

function buildPageList(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i);
  }
  const pages: Array<number | 'ellipsis'> = [0];
  const left = Math.max(1, current - SIBLING_COUNT);
  const right = Math.min(total - 2, current + SIBLING_COUNT);
  if (left > 1) pages.push('ellipsis');
  for (let p = left; p <= right; p++) pages.push(p);
  if (right < total - 2) pages.push('ellipsis');
  pages.push(total - 1);
  return pages;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) {
    if (totalItems === 0) return null;
    return (
      <div
        className={`flex items-center justify-between border-t border-secondary-100 pt-[16px] mt-[16px] ${className}`}
      >
        <span className="text-[13px] text-secondary-500">
          Mostrando {totalItems} resultado{totalItems !== 1 ? 's' : ''}
        </span>
        <span className="text-[13px] text-secondary-500">Página 1 de 1</span>
      </div>
    );
  }

  const safePage = Math.min(Math.max(0, page), totalPages - 1);
  const from = safePage * pageSize + 1;
  const to = Math.min((safePage + 1) * pageSize, totalItems);
  const pageList = buildPageList(safePage, totalPages);
  const isFirst = safePage === 0;
  const isLast = safePage === totalPages - 1;

  return (
    <div
      className={`flex items-center justify-between border-t border-secondary-100 pt-[16px] mt-[16px] ${className}`}
    >
      <span className="text-[13px] text-secondary-500">
        Mostrando {from}&ndash;{to} de {totalItems}
      </span>
      <div className="flex items-center gap-[8px]">
        <Button
          variant="ghost"
          size="2xs"
          onClick={() => onPageChange(safePage - 1)}
          disabled={isFirst}
          aria-label="Página anterior"
        >
          Anterior
        </Button>
        <div className="flex items-center gap-[4px]">
          {pageList.map((p, idx) =>
            p === 'ellipsis' ? (
              <span
                key={`e-${idx}`}
                className="text-[13px] text-secondary-400 px-[4px]"
                aria-hidden="true"
              >
                &hellip;
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                aria-label={`Ir a la página ${p + 1}`}
                aria-current={p === safePage ? 'page' : undefined}
                className={`btn btn-2xs ${p === safePage ? 'btn-primary' : 'btn-ghost'}`}
              >
                {p + 1}
              </button>
            ),
          )}
        </div>
        <Button
          variant="ghost"
          size="2xs"
          onClick={() => onPageChange(safePage + 1)}
          disabled={isLast}
          aria-label="Página siguiente"
        >
          Siguiente
        </Button>
        <span className="text-[13px] text-secondary-500 ml-[8px]">
          Página {safePage + 1} de {totalPages}
        </span>
      </div>
    </div>
  );
}

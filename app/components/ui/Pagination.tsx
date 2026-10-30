"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  clampPageSize,
  getPaginationState,
  getVisiblePages,
} from '@/app/lib/pagination';

export interface PaginationProps {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

const BASE_PAGE_SIZES = [5, 10, 25, 50, 100];

export default function Pagination({
  totalItems,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { page, totalPages, start, end } = getPaginationState(
    totalItems,
    currentPage,
    itemsPerPage,
  );
  const safeItemsPerPage = clampPageSize(itemsPerPage);
  const visiblePages = useMemo(
    () => getVisiblePages(page, totalPages),
    [page, totalPages],
  );
  const pageSizeOptions = useMemo(
    () =>
      Array.from(new Set([...BASE_PAGE_SIZES, safeItemsPerPage])).sort(
        (a, b) => a - b,
      ),
    [safeItemsPerPage],
  );

  /**
   * If the list shrinks under the user (filter applied, row deleted), snap the
   * parent back to the last valid page instead of rendering an empty table with
   * no usable page buttons.
   */
  useEffect(() => {
    if (currentPage !== page) {
      onPageChange(page);
    }
  }, [currentPage, page, onPageChange]);

  useEffect(() => {
    const closeDropdown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, []);

  const goToPage = (nextPage: number) => {
    const clamped = Math.min(Math.max(1, nextPage), totalPages);
    if (clamped !== page) onPageChange(clamped);
  };

  const nextPage = () => goToPage(page + 1);
  const prevPage = () => goToPage(page - 1);

  const updateItemsPerPage = (value: number) => {
    const nextSize = clampPageSize(value);
    onItemsPerPageChange(nextSize);
    // A larger page size can leave us past the last page.
    onPageChange(1);
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          type="button"
          onClick={prevPage}
          disabled={page <= 1}
          className="relative inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="flex items-center text-xs text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={nextPage}
          disabled={page >= totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing{' '}
            <span className="font-semibold text-foreground">{start}</span>
            {' '}to{' '}
            <span className="font-semibold text-foreground">{end}</span>
            {' '}of{' '}
            <span className="font-semibold text-foreground">{Math.max(0, totalItems)}</span>
            {' '}results
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Items per page selector */}
          <div className="flex items-center gap-2 relative" ref={dropdownRef}>
            <label className="text-sm text-muted-foreground">Rows per page:</label>
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-16 rounded-lg border-0 py-1.5 pl-3 pr-2 text-foreground ring-1 ring-inset ring-border hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6 bg-card transition-colors cursor-pointer"
            >
              {safeItemsPerPage}
              <svg className="h-4 w-4 text-muted-foreground shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>

            {isDropdownOpen && (
              <div
                role="listbox"
                className="absolute bottom-full right-0 mb-1 w-16 rounded-lg bg-popover ring-1 ring-border z-50 overflow-hidden py-1"
              >
                {pageSizeOptions.map(option => (
                  <button
                    type="button"
                    role="option"
                    aria-selected={option === safeItemsPerPage}
                    key={option}
                    onClick={() => updateItemsPerPage(option)}
                    className={`w-full text-left px-3 py-1.5 text-sm text-popover-foreground hover:bg-accent transition-colors ${option === safeItemsPerPage ? 'bg-primary/10 text-primary font-medium' : ''}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md" aria-label="Pagination">
              <button
                type="button"
                onClick={prevPage}
                disabled={page <= 1}
                aria-label="Previous page"
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-muted-foreground ring-1 ring-inset ring-border hover:bg-accent focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              </button>

              {visiblePages.map(pageNumber => (
                <button
                  type="button"
                  key={pageNumber}
                  onClick={() => goToPage(pageNumber)}
                  aria-label={`Page ${pageNumber}`}
                  aria-current={pageNumber === page ? 'page' : undefined}
                  className={
                    pageNumber === page
                      ? 'relative z-10 inline-flex items-center bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                      : 'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-inset ring-border hover:bg-accent focus:z-20 focus:outline-offset-0'
                  }
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                onClick={nextPage}
                disabled={page >= totalPages}
                aria-label="Next page"
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-muted-foreground ring-1 ring-inset ring-border hover:bg-accent focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

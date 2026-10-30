/**
 * Shared pagination math used by every table in the admin portal.
 *
 * The API is 1-indexed (`page` starts at 1) while TanStack table is 0-indexed.
 * Keep the math in one place so "page 5 of 2" / blank-page states cannot happen.
 */

export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 25;

export type PaginationState = {
  /** Current page, always clamped to [1, totalPages]. */
  page: number;
  totalPages: number;
  /** 1-based index of the first row on this page (0 when there are no rows). */
  start: number;
  /** 1-based index of the last row on this page (0 when there are no rows). */
  end: number;
  itemsPerPage: number;
  totalItems: number;
};

export function clampPageSize(itemsPerPage?: number): number {
  const size = Math.floor(Number(itemsPerPage));
  if (!Number.isFinite(size) || size < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(MAX_PAGE_SIZE, size);
}

export function clampPage(page: number | undefined, totalPages: number): number {
  const total = Math.max(1, Math.floor(Number(totalPages)) || 1);
  const safePage = Math.floor(Number(page));
  if (!Number.isFinite(safePage) || safePage < 1) return 1;
  return Math.min(safePage, total);
}

export function getTotalPages(totalItems: number, itemsPerPage?: number): number {
  const size = clampPageSize(itemsPerPage);
  const total = Math.max(0, Math.floor(Number(totalItems)) || 0);
  return Math.max(1, Math.ceil(total / size));
}

export function getPaginationState(
  totalItems: number,
  currentPage: number | undefined,
  itemsPerPage?: number,
): PaginationState {
  const size = clampPageSize(itemsPerPage);
  const total = Math.max(0, Math.floor(Number(totalItems)) || 0);
  const totalPages = Math.max(1, Math.ceil(total / size));
  const page = clampPage(currentPage, totalPages);
  const start = total === 0 ? 0 : (page - 1) * size + 1;
  const end = total === 0 ? 0 : Math.min(page * size, total);

  return { page, totalPages, start, end, itemsPerPage: size, totalItems: total };
}

/**
 * A contiguous window of at most `maxVisible` page numbers that always
 * contains `currentPage`. Prevents the "no page buttons" state that happened
 * when the current page was beyond the last page.
 */
export function getVisiblePages(
  currentPage: number | undefined,
  totalPages: number,
  maxVisible = 5,
): number[] {
  const total = Math.max(1, Math.floor(Number(totalPages)) || 1);
  const current = clampPage(currentPage, total);
  const count = Math.max(1, Math.min(Math.floor(maxVisible) || 1, total));

  let start = current - Math.floor(count / 2);
  if (start < 1) start = 1;
  if (start + count - 1 > total) start = total - count + 1;

  return Array.from({ length: count }, (_, index) => start + index);
}

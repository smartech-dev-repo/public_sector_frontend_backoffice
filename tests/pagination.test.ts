import { describe, expect, it } from 'vitest';
import {
  MAX_PAGE_SIZE,
  clampPage,
  clampPageSize,
  getPaginationState,
  getTotalPages,
  getVisiblePages,
} from '@/app/lib/pagination';

describe('pagination math', () => {
  it('clamps rows-per-page into the API-supported range', () => {
    expect(clampPageSize(undefined)).toBe(25);
    expect(clampPageSize(0)).toBe(25);
    expect(clampPageSize(-5)).toBe(25);
    expect(clampPageSize(10)).toBe(10);
    expect(clampPageSize(100)).toBe(100);
    expect(clampPageSize(200)).toBe(MAX_PAGE_SIZE);
    expect(clampPageSize(Number.NaN)).toBe(25);
  });

  it('computes at least one page when there are no rows', () => {
    expect(getTotalPages(0, 25)).toBe(1);
    expect(getTotalPages(1, 25)).toBe(1);
    expect(getTotalPages(25, 25)).toBe(1);
    expect(getTotalPages(26, 25)).toBe(2);
    expect(getTotalPages(100, 10)).toBe(10);
  });

  it('clamps an out-of-range page to the last page', () => {
    expect(clampPage(5, 2)).toBe(2);
    expect(clampPage(0, 2)).toBe(1);
    expect(clampPage(-1, 2)).toBe(1);
    expect(clampPage(undefined, 2)).toBe(1);
    expect(clampPage(3, 0)).toBe(1);
  });

  it('returns a consistent state for an empty result set', () => {
    const state = getPaginationState(0, 4, 25);
    expect(state).toEqual({
      page: 1,
      totalPages: 1,
      start: 0,
      end: 0,
      itemsPerPage: 25,
      totalItems: 0,
    });
  });

  it('never shows "showing 101 to 100 of 100"', () => {
    const state = getPaginationState(100, 9, 25);
    expect(state.page).toBe(4);
    expect(state.start).toBe(76);
    expect(state.end).toBe(100);
  });

  it('reports the correct row window on normal pages', () => {
    expect(getPaginationState(250, 1, 25)).toMatchObject({ start: 1, end: 25, totalPages: 10 });
    expect(getPaginationState(250, 5, 25)).toMatchObject({ start: 101, end: 125 });
    expect(getPaginationState(250, 10, 25)).toMatchObject({ start: 226, end: 250 });
  });

  it('always returns a page window that contains the current page', () => {
    expect(getVisiblePages(1, 10)).toEqual([1, 2, 3, 4, 5]);
    expect(getVisiblePages(5, 10)).toEqual([3, 4, 5, 6, 7]);
    expect(getVisiblePages(10, 10)).toEqual([6, 7, 8, 9, 10]);
    expect(getVisiblePages(3, 3)).toEqual([1, 2, 3]);
    expect(getVisiblePages(99, 2)).toEqual([1, 2]);
    expect(getVisiblePages(1, 1)).toEqual([1]);
  });

  it('supports a custom window size', () => {
    expect(getVisiblePages(4, 10, 3)).toEqual([3, 4, 5]);
    expect(getVisiblePages(1, 2, 7)).toEqual([1, 2]);
  });
});

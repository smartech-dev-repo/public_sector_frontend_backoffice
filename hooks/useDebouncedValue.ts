'use client';

import { useEffect, useState } from 'react';

/**
 * Debounces a rapidly-changing value (typically a search box). The effect that
 * builds query params should depend on the debounced value, not the raw one,
 * so a 10-character search fires one request instead of ten.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

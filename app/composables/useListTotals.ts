import { useEffect, useState } from 'react';
import { useDataVersion } from '@/app/composables/useDataVersion';

export type TotalSources = Record<string, (() => Promise<any>) | null>;

const totalFrom = (res: any): number | undefined => {
 if (!res || res.type === 'ERROR') return undefined;
 if (Array.isArray(res.data)) return res.data.length;
 return res.data?.meta?.total;
};

/** The full record count behind each tab, kept current as records change. */
export const useListTotals = (sources: TotalSources) => {
 const version = useDataVersion();
 const [totals, setTotals] = useState<Record<string, number>>({});
 const key = Object.entries(sources).filter(([, source]) => source).map(([id]) => id).join('|');

 useEffect(() => {
  let stale = false;
  Object.entries(sources).forEach(async ([id, source]) => {
   if (!source) return;
   const total = totalFrom(await source());
   if (!stale && total !== undefined) setTotals((current) => ({ ...current, [id]: total }));
  });
  return () => { stale = true; };
 }, [key, version]); // eslint-disable-line react-hooks/exhaustive-deps

 return totals;
};

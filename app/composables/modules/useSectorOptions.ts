import { useEffect, useState } from 'react';
import { sectors_api } from '@/app/api_factory/modules/sectors';
import { useDataVersion } from '@/app/composables/useDataVersion';

/** Sectors as filter options. They come from the server, so one added by an upload appears on its own. */
export const useSectorOptions = () => {
 const dataVersion = useDataVersion();
 const [options, setOptions] = useState<{ value: string; label: string }[]>([]);

 useEffect(() => {
  let stale = false;
  sectors_api.list().then((res: any) => {
   if (stale || res?.type === 'ERROR') return;
   setOptions((res.data ?? []).map((sector: any) => ({ value: sector.code, label: sector.code })));
  });
  return () => { stale = true; };
 }, [dataVersion]);

 return options;
};

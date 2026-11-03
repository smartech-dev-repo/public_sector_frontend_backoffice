import { useState, useCallback } from 'react';
import { management_fees_api } from '@/app/api_factory/modules/managementFees';

export const useManagementFees = () => {
 const [loading, setLoading] = useState(false);
 const [fees, setFees] = useState([] as any[]);
 const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });

 const fetchFees = useCallback(async (params?: any) => {
  setLoading(true);
  try {
   const res: any = await management_fees_api.list(params);
   setFees(Array.isArray(res.data?.data) ? res.data.data : []);
   if (res.data?.meta) setMeta(res.data.meta);
  } finally {
   setLoading(false);
  }
 }, []);

 // The axios interceptor toasts the failure and resolves, so callers only need a yes/no.
 const saveFee = useCallback(async (id: string | null, payload: any) => {
  const res: any = id ? await management_fees_api.update(id, payload) : await management_fees_api.create(payload);
  return res.type !== 'ERROR';
 }, []);

 const removeFee = useCallback(async (id: string) => {
  const res: any = await management_fees_api.remove(id);
  return res.type !== 'ERROR';
 }, []);

 return { loading, fees, meta, fetchFees, saveFee, removeFee };
};

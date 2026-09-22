import { useState, useCallback } from 'react';
import { reconciliation_api } from '@/app/api_factory/modules/reconciliation';

export const useReconciliation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reconciliation, setReconciliation] = useState([] as any[]);

  const fetchReconciliation = useCallback(async (params?: any) => {
    setLoading(true);
    try {
      const res = await reconciliation_api.getReconciliation(params);
      let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || res.data?.agents || res.data?.clients || res.data?.roles || res.data?.admins || res.data?.logs || res.data?.invites || res.data?.permissions || res.data?.batches || []);
      dataList = Array.isArray(dataList) ? dataList : [];
      setReconciliation(dataList);
      return dataList;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, reconciliation, fetchReconciliation };
};

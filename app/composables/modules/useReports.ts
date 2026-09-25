import { useState, useCallback } from 'react';
import { reports_api } from '@/app/api_factory/modules/reports';

export const useReports = () => {
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });
  const [error, setError] = useState(null);
  const [reports, setReports] = useState([] as any[]);

  const fetchReports = useCallback(async (params?: any) => {
    setLoading(true);
    try {
      const res = await reports_api.getReports(params);
      let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || res.data?.reports || []);
      if (res.data?.meta) setMeta(res.data.meta);
      dataList = Array.isArray(dataList) ? dataList : [];
      setReports(dataList);
      return dataList;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, reports, meta, fetchReports };
};

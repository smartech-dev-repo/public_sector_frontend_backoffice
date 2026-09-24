import { useState, useCallback } from 'react';
import { auditLogs_api } from '@/app/api_factory/modules/auditLogs';

export const useAuditLogs = () => {
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([] as any[]);

  const fetchLogs = useCallback(async (params?: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await auditLogs_api.getLogs(params);
      let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || res.data?.agents || res.data?.clients || res.data?.roles || res.data?.admins || res.data?.logs || res.data?.invites || res.data?.permissions || res.data?.batches || []);
      if (res.data?.meta) setMeta(res.data.meta);
      dataList = Array.isArray(dataList) ? dataList : [];
      setLogs(dataList);
      return dataList;
    } catch (err: any) {
      setError(err.message || 'Error fetching audit logs');
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, logs, fetchLogs, meta };
};

import { useState } from 'react';
import { auditLogs_api } from '@/app/api_factory/modules/auditLogs';

export const useAuditLogs = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([] as any[]);

  const fetchLogs = async (params?: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await auditLogs_api.getLogs(params);
      setLogs(res.data);
      return res.data;
    } catch (err: any) {
      setError(err.message || 'Error fetching audit logs');
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, logs, fetchLogs };
};

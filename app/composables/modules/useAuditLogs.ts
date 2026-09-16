import { useState } from '#app';
import { auditLogs_api } from '@/api_factory/modules/auditLogs';

export const useAuditLogs = () => {
  const loading = useState('auditLogs-loading', () => false);
  const error = useState('auditLogs-error', () => null);
  const logs = useState('auditLogs-data', () => [] as any[]);

  const fetchLogs = async (params?: any) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await auditLogs_api.getLogs(params);
      logs.value = res.data;
      return res.data;
    } catch (err: any) {
      error.value = err.message || 'Error fetching audit logs';
    } finally {
      loading.value = false;
    }
  };

  return { loading, error, logs, fetchLogs };
};

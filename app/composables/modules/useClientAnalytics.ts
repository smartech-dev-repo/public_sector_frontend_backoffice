import { useState, useCallback } from 'react';
import { clients_api } from '@/app/api_factory/modules/clients';

export interface ClientAnalytics {
  totalClients: number;
  bySource?: {
    SELF?: number;
    AGENT?: number;
    ADMIN?: number;
    NONE?: number;
    [key: string]: number | undefined;
  };
  byOnboardingStep?: Record<string, number>;
  byClientStatus?: Record<string, number>;
  agentLeaderboard?: Array<{
    agentId: string;
    agentName: string;
    totalOnboarded: number;
    completedCount: number;
    stalledCount: number;
  }>;
  activity?: {
    clientsWithAtLeastOneLoanRequest?: number;
    clientsWithAtLeastOneDisbursedLoan?: number;
    clientsWithAtLeastOneSession?: number;
    totalLoanRequests?: number;
    totalWalletEntries?: number;
  };
}

export const useClientAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<ClientAnalytics | null>(null);

  const fetchAnalytics = useCallback(async (params?: { createdFrom?: string; createdTo?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await clients_api.getClientAnalytics(params);
      const data = res.data?.data || res.data;
      setAnalytics(data);
      return data;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to load client analytics';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, analytics, fetchAnalytics };
};

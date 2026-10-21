import { useState, useCallback } from 'react';
import { 
  agent_recruitment_api, 
  ListRecruitmentApplicationsParams, 
  RecruitmentAnalyticsParams 
} from '@/app/api_factory/modules/agentRecruitment';

export interface AgentRecruitmentApplication {
  id: string;
  email: string;
  status: 'EMAIL_PENDING' | 'EMAIL_VERIFIED' | 'SUBMITTED' | string;
  emailVerifiedAt: string | null;
  fullName: string | null;
  phone: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  localGovernment: string | null;
  nin: string | null;
  ninVerified: boolean | null;
  ninVerifiedName: string | null;
  coverLetter: string | null;
  cvKey: string | null;
  cvUrl?: string | null;
  passportPhotoKey: string | null;
  passportPhotoUrl?: string | null;
  identityDocumentKey: string | null;
  identityDocumentUrl?: string | null;
  ninSlipKey?: string | null;
  ninSlipUrl?: string | null;
  submittedAgent: {
    id: string;
    status: string;
    mustChangePassword?: boolean;
  } | null;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface RecruitmentAnalytics {
  totalApplications: number;
  byStatus: {
    EMAIL_PENDING: number;
    EMAIL_VERIFIED: number;
    SUBMITTED: number;
    [key: string]: number;
  };
  conversionRate: number | null;
  averageTimeToSubmitHours: number | null;
}

export const useAgentRecruitment = () => {
  const [loading, setLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<AgentRecruitmentApplication[]>([]);
  const [analytics, setAnalytics] = useState<RecruitmentAnalytics | null>(null);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });

  const fetchApplications = useCallback(async (params?: ListRecruitmentApplicationsParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await agent_recruitment_api.getApplications(params);
      const dataList = Array.isArray(res.data) 
        ? res.data 
        : (res.data?.data || res.data?.result || res.data?.applications || []);
      if (res.data?.meta) {
        setMeta(res.data.meta);
      }
      const safeList = Array.isArray(dataList) ? dataList : [];
      setApplications(safeList);
      return safeList;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to fetch recruitment applications';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async (params?: RecruitmentAnalyticsParams) => {
    setAnalyticsLoading(true);
    try {
      const res = await agent_recruitment_api.getAnalytics(params);
      const data = res.data?.data || res.data;
      setAnalytics(data);
      return data;
    } catch (err: any) {
      // Graceful fallback
      return null;
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const getApplicationById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await agent_recruitment_api.getApplicationById(id);
      return (res.data?.data || res.data) as AgentRecruitmentApplication;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to load application details';
      throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteApplication = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await agent_recruitment_api.deleteApplication(id);
      return res.data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to delete application';
      throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    analyticsLoading,
    error,
    applications,
    analytics,
    meta,
    fetchApplications,
    fetchAnalytics,
    getApplicationById,
    deleteApplication
  };
};

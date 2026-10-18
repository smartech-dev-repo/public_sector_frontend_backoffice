import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export interface ListRecruitmentApplicationsParams {
  status?: string;
  q?: string;
  createdFrom?: string;
  createdTo?: string;
  page?: number;
  limit?: number;
}

export interface RecruitmentAnalyticsParams {
  createdFrom?: string;
  createdTo?: string;
}

export const agent_recruitment_api = {
  getApplications: (params?: ListRecruitmentApplicationsParams) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/agent-recruitment-applications', { params });
  },
  getAnalytics: (params?: RecruitmentAnalyticsParams) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/agent-recruitment-applications/analytics', { params });
  },
  getApplicationById: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/agent-recruitment-applications/${id}`);
  },
  deleteApplication: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.delete(`/admin/agent-recruitment-applications/${id}`);
  }
};

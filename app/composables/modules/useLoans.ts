import { useState, useCallback } from 'react';
import { loans_api } from '@/app/api_factory/modules/loans';

const unwrapResponse = (res: any, defaultErrMsg = 'Operation failed') => {
  if (!res) {
    throw new Error(defaultErrMsg);
  }
  if (
    res.type === 'ERROR' ||
    (typeof res.status === 'number' && res.status >= 400) ||
    (typeof res.statusCode === 'number' && res.statusCode >= 400) ||
    (res.data && typeof res.data.statusCode === 'number' && res.data.statusCode >= 400)
  ) {
    const errorMsg =
      res.data?.message ||
      res.message ||
      res.data?.error ||
      res.error ||
      defaultErrMsg;
    const formatted = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg;
    const err: any = new Error(formatted);
    err.response = res;
    err.statusCode = res.status || res.data?.statusCode || res.statusCode;
    throw err;
  }
  return res;
};

export const useLoans = () => {
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });
  const [error, setError] = useState<string | null>(null);
  const [loans, setLoans] = useState([] as any[]);
  const [loanTerms, setLoanTerms] = useState([] as any[]);
  const [loanProducts, setLoanProducts] = useState([] as any[]);
  const [loanProductSectors, setLoanProductSectors] = useState([] as string[]);
  const [loanSettings, setLoanSettings] = useState(null as any);
  const [loanRequests, setLoanRequests] = useState([] as any[]);
  const [disbursementSummary, setDisbursementSummary] = useState(null as any);
  const [clientLoans, setClientLoans] = useState([] as any[]);

  const fetchLoans = useCallback(async (params?: any) => {
    setLoading(true);
    try {
      const res = await loans_api.getLoans(params);
      unwrapResponse(res, 'Failed to fetch loans');
      let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || []);
      if (res.data?.meta) setMeta(res.data.meta);
      dataList = Array.isArray(dataList) ? dataList : [];
      setLoans(dataList);
      return dataList;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLoanTerms = useCallback(async (params?: any) => {
    setLoading(true);
    try {
      const res = await loans_api.getLoanTerms(params);
      unwrapResponse(res, 'Failed to fetch loan terms');
      let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || []);
      dataList = Array.isArray(dataList) ? dataList : [];
      setLoanTerms(dataList);
      return dataList;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createLoanTerm = useCallback(async (data: any) => {
    setLoading(true);
    try {
      const res = await loans_api.createLoanTerm(data);
      unwrapResponse(res, 'Failed to create loan term');
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLoanTerm = useCallback(async (id: string, data: any) => {
    setLoading(true);
    try {
      const res = await loans_api.updateLoanTerm(id, data);
      unwrapResponse(res, 'Failed to update loan term');
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLoanProducts = useCallback(async (params?: any) => {
    setLoading(true);
    try {
      const res = await loans_api.getLoanProducts(params);
      unwrapResponse(res, 'Failed to fetch loan products');
      let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || []);
      if (res.data?.meta) setMeta(res.data.meta);
      dataList = Array.isArray(dataList) ? dataList : [];
      setLoanProducts(dataList);
      return dataList;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createLoanProduct = useCallback(async (data: any) => {
    setLoading(true);
    try {
      const res = await loans_api.createLoanProduct(data);
      unwrapResponse(res, 'Failed to create loan product');
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLoanProduct = useCallback(async (id: string, data: any) => {
    setLoading(true);
    try {
      const res = await loans_api.updateLoanProduct(id, data);
      unwrapResponse(res, 'Failed to update loan product');
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLoanProductSectors = useCallback(async () => {
    try {
      const res = await loans_api.getLoanProductSectors();
      unwrapResponse(res, 'Failed to fetch sectors');
      const data = res.data?.data || res.data;
      const safe = Array.isArray(data) ? data : [];
      setLoanProductSectors(safe);
      return safe;
    } catch (err: any) {
      console.error('Failed to fetch sectors', err);
      return [];
    }
  }, []);

  const fetchLoanSettings = useCallback(async () => {
    try {
      const res = await loans_api.getLoanSettings();
      unwrapResponse(res, 'Failed to fetch loan settings');
      setLoanSettings(res.data);
      return res.data;
    } catch (err: any) {
      console.error('Failed to fetch loan settings', err);
      return null;
    }
  }, []);

  const updateLoanSettings = useCallback(async (data: any) => {
    setLoading(true);
    try {
      const res = await loans_api.updateLoanSettings(data);
      unwrapResponse(res, 'Failed to update loan settings');
      setLoanSettings(res.data);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLoanRequests = useCallback(async (params?: any) => {
    setLoading(true);
    try {
      const res = await loans_api.getLoanRequests(params);
      unwrapResponse(res, 'Failed to fetch loan requests');
      let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || []);
      if (res.data?.meta) setMeta(res.data.meta);
      dataList = Array.isArray(dataList) ? dataList : [];
      setLoanRequests(dataList);
      return dataList;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getLoanRequestById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await loans_api.getLoanRequestById(id);
      unwrapResponse(res, 'Failed to fetch loan request');
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const approveLoanRequest = useCallback(async (id: string, payload?: { disbursedAt?: string }) => {
    setLoading(true);
    try {
      const res = await loans_api.approveLoanRequest(id, payload);
      unwrapResponse(res, 'Failed to approve loan request');
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmLoanRequestCode = useCallback(async (id: string, code: string) => {
    setLoading(true);
    try {
      const res = await loans_api.confirmLoanRequestCode(id, { code });
      unwrapResponse(res, 'Failed to confirm loan request code');
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectLoanRequest = useCallback(async (id: string, data: { reason: string }) => {
    setLoading(true);
    try {
      const res = await loans_api.rejectLoanRequest(id, data);
      unwrapResponse(res, 'Failed to reject loan request');
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const disburseLoanRequest = useCallback(async (id: string, payload?: { disbursedAt?: string }) => {
    setLoading(true);
    try {
      const res = await loans_api.disburseLoanRequest(id, payload);
      unwrapResponse(res, 'Failed to disburse loan request');
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDisbursementSummary = useCallback(async (params?: any) => {
    setLoading(true);
    try {
      const res = await loans_api.getDisbursementSummary(params);
      unwrapResponse(res, 'Failed to fetch disbursement summary');
      setDisbursementSummary(res.data);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClientLoans = useCallback(async (params?: any) => {
    if (params && !params.clientId) {
      setClientLoans([]);
      setMeta({ total: 0, page: 1, limit: params?.limit || 25, totalPages: 1 });
      return [];
    }
    setLoading(true);
    try {
      const res = await loans_api.getClientLoans(params);
      unwrapResponse(res, 'Failed to fetch client loans');
      let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || []);
      if (res.data?.meta) setMeta(res.data.meta);
      dataList = Array.isArray(dataList) ? dataList : [];
      setClientLoans(dataList);
      return dataList;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getClientLoanRepaymentPlan = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await loans_api.getClientLoanRepaymentPlan(id);
      unwrapResponse(res, 'Failed to fetch repayment plan');
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    loading, error, loans, loanTerms, loanProducts, loanProductSectors, loanSettings, loanRequests, disbursementSummary, clientLoans, meta,
    fetchLoans, fetchLoanTerms, createLoanTerm, updateLoanTerm,
    fetchLoanProducts, createLoanProduct, updateLoanProduct, fetchLoanProductSectors,
    fetchLoanSettings, updateLoanSettings,
    fetchLoanRequests, getLoanRequestById, approveLoanRequest, confirmLoanRequestCode, rejectLoanRequest, disburseLoanRequest, fetchDisbursementSummary,
    fetchClientLoans, getClientLoanRepaymentPlan
  };
};

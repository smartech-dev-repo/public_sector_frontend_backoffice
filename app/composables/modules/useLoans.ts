import { useState, useCallback } from 'react';
import { loans_api } from '@/app/api_factory/modules/loans';

export const useLoans = () => {
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });
  const [error, setError] = useState(null);
  const [loans, setLoans] = useState([] as any[]);
  const [loanTerms, setLoanTerms] = useState([] as any[]);
  const [loanRequests, setLoanRequests] = useState([] as any[]);
  const [disbursementSummary, setDisbursementSummary] = useState(null as any);

  const fetchLoans = useCallback(async (params?: any) => {
    setLoading(true);
    try {
      const res = await loans_api.getLoans(params);
      let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || res.data?.agents || res.data?.clients || res.data?.roles || res.data?.admins || res.data?.logs || res.data?.invites || res.data?.permissions || res.data?.batches || []);
      if (res.data?.meta) setMeta(res.data.meta);
      dataList = Array.isArray(dataList) ? dataList : [];
      setLoans(dataList);
      return dataList;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLoanTerms = useCallback(async (params?: any) => {
    setLoading(true);
    try {
      const res = await loans_api.getLoanTerms(params);
      let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || res.data?.agents || res.data?.clients || res.data?.roles || res.data?.admins || res.data?.logs || res.data?.invites || res.data?.permissions || res.data?.batches || []);
      dataList = Array.isArray(dataList) ? dataList : [];
      setLoanTerms(dataList);
      return dataList;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createLoanTerm = useCallback(async (data: any) => {
    setLoading(true);
    try {
      const res = await loans_api.createLoanTerm(data);
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
      let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || res.data?.agents || res.data?.clients || res.data?.roles || res.data?.admins || res.data?.logs || res.data?.invites || res.data?.permissions || res.data?.batches || []);
      dataList = Array.isArray(dataList) ? dataList : [];
      setLoanRequests(dataList);
      return dataList;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const approveLoanRequest = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await loans_api.approveLoanRequest(id);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectLoanRequest = useCallback(async (id: string, data: any) => {
    setLoading(true);
    try {
      const res = await loans_api.rejectLoanRequest(id, data);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const disburseLoanRequest = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await loans_api.disburseLoanRequest(id);
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
      setDisbursementSummary(res.data);
      return res.data;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    loading, error, loans, loanTerms, loanRequests, disbursementSummary,
    fetchLoans, fetchLoanTerms, createLoanTerm, updateLoanTerm, fetchLoanRequests,
    approveLoanRequest, rejectLoanRequest, disburseLoanRequest, fetchDisbursementSummary
  };
};

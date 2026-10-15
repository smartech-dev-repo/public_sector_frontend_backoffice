import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

const mockLoanTerms = [
  {
    "id": "1",
    "agency": "NPF",
    "tenor": 12,
    "interestRate": 5.5,
    "status": "ACTIVE"
  },
  {
    "id": "2",
    "agency": "FEDERAL_MINISTRY",
    "tenor": 24,
    "interestRate": 6.5,
    "status": "ACTIVE"
  }
];

export const mockLoanProducts = [
  {
    id: "c5d6e7f8-a9b0-4c1d-2e3f-4a5b6c7d8e9f",
    productName: "NPF Personal Loan",
    productCode: "MMFB-NPFPL",
    sectors: ["NPF"],
    minimumAmount: 200000,
    maximumAmount: 3000000,
    minimumTenorMonths: 6,
    maximumTenorMonths: 12,
    interestTiers: [
      { minTenorMonths: 6, maxTenorMonths: 12, interestRatePercent: 3.5 },
      { minTenorMonths: 13, maxTenorMonths: 18, interestRatePercent: 3.5 },
      { minTenorMonths: 19, maxTenorMonths: 24, interestRatePercent: 3.5 },
      { minTenorMonths: 25, maxTenorMonths: 30, interestRatePercent: 3.5 }
    ],
    managementChargeType: "PERCENTAGE",
    managementChargeValue: 2,
    managementChargeApplication: "DEDUCT_FROM_DISBURSEMENT",
    minimumServiceMonthsLeft: 24,
    maximumMonthsInService: 35,
    isActive: true,
    createdAt: "2026-10-13T10:00:00.000Z",
    updatedAt: "2026-10-13T10:00:00.000Z"
  },
  {
    id: "d6e7f8a9-b0c1-4d2e-3f4a-5b6c7d8e9f0a",
    productName: "Police Special Asset Loan",
    productCode: "MMFB-PSAL",
    sectors: ["NPF"],
    minimumAmount: 500000,
    maximumAmount: 5000000,
    minimumTenorMonths: 12,
    maximumTenorMonths: 24,
    interestTiers: [
      { minTenorMonths: 6, maxTenorMonths: 12, interestRatePercent: 4.0 },
      { minTenorMonths: 13, maxTenorMonths: 24, interestRatePercent: 4.5 }
    ],
    managementChargeType: "PERCENTAGE",
    managementChargeValue: 2.5,
    managementChargeApplication: "DEDUCT_FROM_DISBURSEMENT",
    minimumServiceMonthsLeft: 36,
    maximumMonthsInService: 35,
    isActive: true,
    createdAt: "2026-10-13T11:00:00.000Z",
    updatedAt: "2026-10-13T11:00:00.000Z"
  },
  {
    id: "e7f8a9b0-c1d2-4e3f-4a5b-6c7d8e9f0a1b",
    productName: "Civil Service Personal Loan",
    productCode: "MMFB-CSPL",
    sectors: ["IPPIS", "LASG"],
    minimumAmount: 150000,
    maximumAmount: 2500000,
    minimumTenorMonths: 6,
    maximumTenorMonths: 18,
    interestTiers: [
      { minTenorMonths: 6, maxTenorMonths: 12, interestRatePercent: 3.8 },
      { minTenorMonths: 13, maxTenorMonths: 18, interestRatePercent: 4.2 }
    ],
    managementChargeType: "PERCENTAGE",
    managementChargeValue: 2,
    managementChargeApplication: "DEDUCT_FROM_DISBURSEMENT",
    minimumServiceMonthsLeft: 18,
    maximumMonthsInService: 35,
    isActive: true,
    createdAt: "2026-10-13T12:00:00.000Z",
    updatedAt: "2026-10-13T12:00:00.000Z"
  }
];

export const mockSectorsList = [
  "NPF",
  "NSCDC",
  "IMMIGRATION",
  "CORRECTIONAL",
  "CUSTOM",
  "LASG",
  "IPPIS"
];

let inMemoryProducts = [...mockLoanProducts];
let inMemorySettings = {
  id: "e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b",
  retirementAgeYears: 60,
  maxServiceYears: 35,
  updatedAt: new Date().toISOString()
};

export const loans_api = {
  getLoanProducts: async (params?: any) => {
    const res = await GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/loan-products', { 
      params,
      ...({ skipToastOn404: true } as any)
    });
    if ((res as any)?.type === 'ERROR' && (res as any)?.status === 404) {
      return { 
        data: {
          data: inMemoryProducts,
          meta: { total: inMemoryProducts.length, page: 1, limit: 25, totalPages: 1 }
        }
      };
    }
    return res;
  },
  createLoanProduct: async (payload: any) => {
    const res = await GATEWAY_ENDPOINT_WITH_AUTH.post('/admin/loan-products', payload, {
      ...({ skipToastOn404: true } as any)
    });
    if ((res as any)?.type === 'ERROR' && (res as any)?.status === 404) {
      const newProd = {
        id: `prod-${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      inMemoryProducts = [newProd, ...inMemoryProducts];
      return { data: newProd };
    }
    return res;
  },
  updateLoanProduct: async (id: string, payload: any) => {
    const res = await GATEWAY_ENDPOINT_WITH_AUTH.patch(`/admin/loan-products/${id}`, payload, {
      ...({ skipToastOn404: true } as any)
    });
    if ((res as any)?.type === 'ERROR' && (res as any)?.status === 404) {
      inMemoryProducts = inMemoryProducts.map(p => 
        p.id === id ? { ...p, ...payload, updatedAt: new Date().toISOString() } : p
      );
      const updated = inMemoryProducts.find(p => p.id === id) || { id, ...payload };
      return { data: updated };
    }
    return res;
  },
  getLoanProductSectors: async () => {
    const res = await GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/loan-products/sectors', {
      ...({ skipToastOn404: true } as any)
    });
    if ((res as any)?.type === 'ERROR' && (res as any)?.status === 404) {
      return { data: { sectors: mockSectorsList } };
    }
    return res;
  },
  getLoanSettings: async () => {
    const res = await GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/loan-settings', {
      ...({ skipToastOn404: true } as any)
    });
    if ((res as any)?.type === 'ERROR' && (res as any)?.status === 404) {
      return { data: inMemorySettings };
    }
    return res;
  },
  updateLoanSettings: async (payload: any) => {
    const res = await GATEWAY_ENDPOINT_WITH_AUTH.patch('/admin/loan-settings', payload, {
      ...({ skipToastOn404: true } as any)
    });
    if ((res as any)?.type === 'ERROR' && (res as any)?.status === 404) {
      inMemorySettings = { ...inMemorySettings, ...payload, updatedAt: new Date().toISOString() };
      return { data: inMemorySettings };
    }
    return res;
  },
  getLoans: (params?: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/loans', { params });
  },
  getLoanTerms: async (params?: any) => {
    const res = await GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/loan-terms', { params });
    if ((res as any).type === 'ERROR' && res.status === 404) return { data: mockLoanTerms };
    return res;
  },
  createLoanTerm: (payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post('/admin/loan-terms', payload);
  },
  updateLoanTerm: (id: string, payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.patch(`/admin/loan-terms/${id}`, payload);
  },
  getLoanRequests: async (params?: any) => {
    const res = await GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/loan-requests', { params });
    if ((res as any).type === 'ERROR' && res.status === 404) return { data: [] };
    return res;
  },
  approveLoanRequest: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/loan-requests/${id}/approve`);
  },
  rejectLoanRequest: (id: string, payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/loan-requests/${id}/reject`, payload);
  },
  disburseLoanRequest: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/loan-requests/${id}/disburse`);
  },
  getDisbursementSummary: async (params?: any) => {
    const res = await GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/client-loans/disbursement-summary', { params });
    if ((res as any).type === 'ERROR' && res.status === 404) return { data: { totalDisbursed: 0, count: 0 } };
    return res;
  },
  getClientLoans: (params?: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/client-loans', { params });
  },
  getClientLoanRepaymentPlan: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/client-loans/${id}/repayment-plan`);
  }
};

import { describe, expect, it } from 'vitest';
import {
  buildAdminsParams,
  buildAgentsParams,
  buildAuditLogsParams,
  buildClientLoansParams,
  buildClientsParams,
  buildDepartmentsParams,
  buildDocumentBatchesParams,
  buildInvitesParams,
  buildIppisParams,
  buildLoanRequestsParams,
  buildLoansParams,
  buildReconciliationParams,
  buildRecruitmentApplicationsParams,
  buildRolesParams,
  normalizeFilterValue,
  parseDateRange,
} from '@/app/lib/list-params';

const RANGE = '2026-01-01 to 2026-01-31';

describe('filter value normalization', () => {
  it('drops blank and sentinel values', () => {
    expect(normalizeFilterValue('')).toBeUndefined();
    expect(normalizeFilterValue('   ')).toBeUndefined();
    expect(normalizeFilterValue('all')).toBeUndefined();
    expect(normalizeFilterValue('ALL')).toBeUndefined();
    expect(normalizeFilterValue('none')).toBeUndefined();
    expect(normalizeFilterValue('NONE')).toBeUndefined();
    expect(normalizeFilterValue(null)).toBeUndefined();
    expect(normalizeFilterValue(undefined)).toBeUndefined();
  });

  it('trims real values', () => {
    expect(normalizeFilterValue('  Amaka  ')).toBe('Amaka');
    expect(normalizeFilterValue('PENDING_REVIEW')).toBe('PENDING_REVIEW');
  });

  it('parses both ends of a date range', () => {
    expect(parseDateRange(RANGE)).toEqual({ from: '2026-01-01', to: '2026-01-31' });
    expect(parseDateRange('2026-01-01')).toEqual({ from: '2026-01-01', to: undefined });
    expect(parseDateRange('')).toEqual({ from: undefined, to: undefined });
  });
});

describe('agents filters', () => {
  it('maps status, q and both date ranges', () => {
    expect(
      buildAgentsParams({
        page: 2,
        limit: 10,
        status: 'APPROVED',
        q: 'amaka',
        createdRange: RANGE,
        reviewedRange: '2026-02-01 to 2026-02-28',
      }),
    ).toEqual({
      page: 2,
      limit: 10,
      status: 'APPROVED',
      q: 'amaka',
      createdFrom: '2026-01-01',
      createdTo: '2026-01-31',
      reviewedFrom: '2026-02-01',
      reviewedTo: '2026-02-28',
    });
  });

  it('omits "all"/"none" status and blank search', () => {
    expect(buildAgentsParams({ status: 'none', q: '  ' })).toEqual({ page: 1, limit: 25 });
    expect(buildAgentsParams({ status: 'all' })).toEqual({ page: 1, limit: 25 });
  });

  it('never sends unsupported params', () => {
    const params = buildAgentsParams({ status: 'APPROVED', q: 'x' });
    expect(params).not.toHaveProperty('search');
    expect(params).not.toHaveProperty('from');
  });
});

describe('admins filters', () => {
  it('uses the API contract (q / isActive / createdFrom-To), not search/status/from', () => {
    const params = buildAdminsParams({
      page: 1,
      limit: 25,
      q: 'bello',
      status: 'active',
      createdRange: RANGE,
    });

    expect(params).toEqual({
      page: 1,
      limit: 25,
      q: 'bello',
      isActive: true,
      createdFrom: '2026-01-01',
      createdTo: '2026-01-31',
    });
    expect(params).not.toHaveProperty('search');
    expect(params).not.toHaveProperty('status');
    expect(params).not.toHaveProperty('from');
    expect(params).not.toHaveProperty('to');
  });

  it('maps suspended to isActive=false and ignores "none"', () => {
    expect(buildAdminsParams({ status: 'suspended' }).isActive).toBe(false);
    expect(buildAdminsParams({ status: 'inactive' }).isActive).toBe(false);
    expect(buildAdminsParams({ status: 'none' })).not.toHaveProperty('isActive');
    expect(buildAdminsParams({ status: '' })).not.toHaveProperty('isActive');
  });
});

describe('clients filters', () => {
  it('maps status, q, agentId and created range', () => {
    expect(
      buildClientsParams({
        page: 3,
        limit: 50,
        status: 'MANUAL_REVIEW',
        q: '0801',
        agentId: 'agent-1',
        createdRange: RANGE,
      }),
    ).toEqual({
      page: 3,
      limit: 50,
      status: 'MANUAL_REVIEW',
      q: '0801',
      agentId: 'agent-1',
      createdFrom: '2026-01-01',
      createdTo: '2026-01-31',
    });
  });

  it('maps onboardingSource when supplied', () => {
    expect(buildClientsParams({ onboardingSource: 'AGENT' }).onboardingSource).toBe('AGENT');
  });
});

describe('invites filters', () => {
  it('maps status, q, created and expires ranges', () => {
    expect(
      buildInvitesParams({
        status: 'PENDING',
        q: 'jane@example.com',
        createdRange: RANGE,
        expiresRange: '2026-03-01 to 2026-03-31',
      }),
    ).toEqual({
      page: 1,
      limit: 25,
      status: 'PENDING',
      q: 'jane@example.com',
      createdFrom: '2026-01-01',
      createdTo: '2026-01-31',
      expiresFrom: '2026-03-01',
      expiresTo: '2026-03-31',
    });
  });
});

describe('roles / departments filters', () => {
  it('only sends page/limit/q (the API has no date filter)', () => {
    expect(buildRolesParams({ page: 2, limit: 10, q: 'reviewer' })).toEqual({
      page: 2,
      limit: 10,
      q: 'reviewer',
    });
    expect(buildRolesParams({ q: 'none' })).toEqual({ page: 1, limit: 25 });
  });

  it('shares the contract for departments', () => {
    expect(buildDepartmentsParams({ q: 'finance' })).toEqual({ page: 1, limit: 25, q: 'finance' });
  });
});

describe('audit log filters', () => {
  it('maps action/actorType/targetType/targetId and created range', () => {
    expect(
      buildAuditLogsParams({
        action: 'admin.invite.created',
        actorType: 'ADMIN',
        targetType: 'AdminInvite',
        targetId: 'invite-1',
        createdRange: RANGE,
      }),
    ).toEqual({
      page: 1,
      limit: 25,
      action: 'admin.invite.created',
      actorType: 'ADMIN',
      targetType: 'AdminInvite',
      targetId: 'invite-1',
      createdFrom: '2026-01-01',
      createdTo: '2026-01-31',
    });
  });

  it('drops sentinel dropdown values', () => {
    expect(buildAuditLogsParams({ action: 'none', actorType: 'none', targetType: 'none', targetId: 'none' })).toEqual({
      page: 1,
      limit: 25,
    });
  });
});

describe('loan catalog filters', () => {
  it('sends disbursedFrom/To (not dateFrom/dateTo) for the disbursement filter', () => {
    const params = buildLoansParams({
      q: 'Bello',
      agency: 'NSCDC',
      product: 'SALARY ADVANCE',
      disbursedRange: RANGE,
    });

    expect(params).toMatchObject({
      q: 'Bello',
      agency: 'NSCDC',
      product: 'SALARY ADVANCE',
      disbursedFrom: '2026-01-01',
      disbursedTo: '2026-01-31',
    });
    expect(params).not.toHaveProperty('dateFrom');
    expect(params).not.toHaveProperty('dateTo');
  });

  it('omits "all" agency/product', () => {
    expect(buildLoansParams({ agency: 'all', product: 'all' })).toEqual({ page: 1, limit: 25 });
  });
});

describe('ippis record filters', () => {
  it('sends employeeStatus (not status)', () => {
    const params = buildIppisParams({ status: undefined, employeeStatus: 'ACTIVE', agency: 'NSCDC', q: 'Amaka' } as any);

    expect(params).toMatchObject({ employeeStatus: 'ACTIVE', agency: 'NSCDC', q: 'Amaka' });
    expect(params).not.toHaveProperty('status');
  });

  it('supports department, grade and hire date range', () => {
    expect(
      buildIppisParams({
        department: 'Finance',
        grade: 'GL-08',
        hireDateRange: RANGE,
      }),
    ).toMatchObject({
      department: 'Finance',
      grade: 'GL-08',
      hireDateFrom: '2026-01-01',
      hireDateTo: '2026-01-31',
    });
  });
});

describe('loan request filters', () => {
  it('maps clientId/status/type and both date ranges', () => {
    expect(
      buildLoanRequestsParams({
        page: 2,
        limit: 25,
        clientId: 'client-1',
        status: 'CONFIRMED',
        type: 'TOPUP',
        createdRange: RANGE,
        disbursedRange: '2026-02-01 to 2026-02-28',
      }),
    ).toEqual({
      page: 2,
      limit: 25,
      clientId: 'client-1',
      status: 'CONFIRMED',
      type: 'TOPUP',
      createdFrom: '2026-01-01',
      createdTo: '2026-01-31',
      disbursedFrom: '2026-02-01',
      disbursedTo: '2026-02-28',
    });
  });

  it('drops "none" sentinels', () => {
    expect(buildLoanRequestsParams({ status: 'none', type: 'none' })).toEqual({ page: 1, limit: 25 });
  });
});

describe('client loan filters', () => {
  it('maps clientId/status/agency and disbursed range', () => {
    expect(
      buildClientLoansParams({
        clientId: 'client-1',
        status: 'ACTIVE',
        agency: 'NPF',
        disbursedRange: RANGE,
      }),
    ).toEqual({
      page: 1,
      limit: 25,
      clientId: 'client-1',
      status: 'ACTIVE',
      agency: 'NPF',
      disbursedFrom: '2026-01-01',
      disbursedTo: '2026-01-31',
    });
  });

  it('never sends an unsupported q search param', () => {
    const params = buildClientLoansParams({ clientId: 'client-1', q: 'Amaka' } as any);
    expect(params).not.toHaveProperty('q');
  });
});

describe('document batch filters', () => {
  it('maps documentType/status/q and supplied date ranges', () => {
    expect(
      buildDocumentBatchesParams({
        documentType: 'IPPIS_BROADSHEET',
        status: 'COMPLETED',
        q: '2026-01',
        createdRange: RANGE,
      }),
    ).toMatchObject({
      documentType: 'IPPIS_BROADSHEET',
      status: 'COMPLETED',
      q: '2026-01',
      createdFrom: '2026-01-01',
      createdTo: '2026-01-31',
    });
  });
});

describe('recruitment application filters', () => {
  it('maps status/q/created range', () => {
    expect(
      buildRecruitmentApplicationsParams({
        status: 'EMAIL_VERIFIED',
        q: 'jane',
        createdRange: RANGE,
      }),
    ).toEqual({
      page: 1,
      limit: 25,
      status: 'EMAIL_VERIFIED',
      q: 'jane',
      createdFrom: '2026-01-01',
      createdTo: '2026-01-31',
    });
  });
});

describe('reconciliation filters', () => {
  it('maps agency/status/period/generated range', () => {
    expect(
      buildReconciliationParams({
        agency: 'NSCDC',
        status: 'MATCHED',
        period: '2026-08',
        generatedRange: RANGE,
      }),
    ).toEqual({
      page: 1,
      limit: 25,
      agency: 'NSCDC',
      status: 'MATCHED',
      period: '2026-08',
      generatedFrom: '2026-01-01',
      generatedTo: '2026-01-31',
    });
  });
});

describe('shared pagination params', () => {
  it('never sends a limit above the API hard maximum of 100', () => {
    expect(buildAgentsParams({ limit: 500 }).limit).toBe(100);
    expect(buildClientsParams({ limit: 200 }).limit).toBe(100);
    expect(buildLoansParams({ limit: 1000 }).limit).toBe(100);
  });

  it('normalizes an invalid page back to 1', () => {
    expect(buildAgentsParams({ page: 0 }).page).toBe(1);
    expect(buildAgentsParams({ page: -3 }).page).toBe(1);
    expect(buildAgentsParams({ page: Number.NaN }).page).toBe(1);
  });
});

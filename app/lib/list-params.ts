/**
 * Central mapping from UI filter state to the backend list-query contract.
 *
 * Every filter param name below is taken from the backend Postman collection
 * (`Public Sector Backend.postman_collection.json`). Keeping the mapping here
 * means a page cannot silently send `search`/`status`/`from` when the API
 * expects `q`/`employeeStatus`/`createdFrom`, which is what made several
 * filters look dead.
 */

import { clampPageSize } from './pagination';

export type ListQueryParams = Record<string, string | number | boolean>;

const EMPTY_SENTINELS = new Set(['', 'all', 'any', 'none', 'undefined', 'null']);

/** Returns undefined for blank/"all"/"none" sentinels so they are omitted. */
export function normalizeFilterValue(value?: string | null): string | undefined {
  if (value === null || value === undefined) return undefined;
  const trimmed = String(value).trim();
  if (!trimmed) return undefined;
  if (EMPTY_SENTINELS.has(trimmed.toLowerCase())) return undefined;
  return trimmed;
}

/** Splits the `YYYY-MM-DD to YYYY-MM-DD` string produced by CustomDateRangePicker. */
export function parseDateRange(value?: string | null): { from?: string; to?: string } {
  if (!value) return {};
  const [rawFrom, rawTo] = String(value).split(' to ');
  return {
    from: normalizeFilterValue(rawFrom),
    to: normalizeFilterValue(rawTo),
  };
}

function baseParams(page?: number, limit?: number): ListQueryParams {
  const safePage = Math.floor(Number(page));
  return {
    page: Number.isFinite(safePage) && safePage > 0 ? safePage : 1,
    limit: clampPageSize(limit),
  };
}

function setText(params: ListQueryParams, key: string, value?: string | null): void {
  const normalized = normalizeFilterValue(value);
  if (normalized !== undefined) params[key] = normalized;
}

function setDateRange(params: ListQueryParams, prefix: string, range?: string | null): void {
  const { from, to } = parseDateRange(range);
  if (from) params[`${prefix}From`] = from;
  if (to) params[`${prefix}To`] = to;
}

// ---------------------------------------------------------------------------
// Agents
// GET /admin/agents: status, q, createdFrom/To, reviewedFrom/To
// ---------------------------------------------------------------------------
export type AgentsFilterInput = {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
  createdRange?: string;
  reviewedRange?: string;
};

export function buildAgentsParams(input: AgentsFilterInput = {}): ListQueryParams {
  const params = baseParams(input.page, input.limit);
  setText(params, 'status', input.status);
  setText(params, 'q', input.q);
  setDateRange(params, 'created', input.createdRange);
  setDateRange(params, 'reviewed', input.reviewedRange);
  return params;
}

// ---------------------------------------------------------------------------
// Admins
// GET /admin/admins: isActive, q, createdFrom/To
// ---------------------------------------------------------------------------
export type AdminsFilterInput = {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
  createdRange?: string;
};

export function buildAdminsParams(input: AdminsFilterInput = {}): ListQueryParams {
  const params = baseParams(input.page, input.limit);
  setText(params, 'q', input.q);
  setDateRange(params, 'created', input.createdRange);

  const status = (input.status || '').toLowerCase();
  if (['active', 'true'].includes(status)) params.isActive = true;
  else if (['suspended', 'inactive', 'false'].includes(status)) params.isActive = false;

  return params;
}

// ---------------------------------------------------------------------------
// Clients
// GET /admin/clients: status, q, onboardingSource, agentId, createdFrom/To
// ---------------------------------------------------------------------------
export type ClientsFilterInput = {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
  agentId?: string;
  onboardingSource?: string;
  createdRange?: string;
};

export function buildClientsParams(input: ClientsFilterInput = {}): ListQueryParams {
  const params = baseParams(input.page, input.limit);
  setText(params, 'status', input.status);
  setText(params, 'q', input.q);
  setText(params, 'agentId', input.agentId);
  setText(params, 'onboardingSource', input.onboardingSource);
  setDateRange(params, 'created', input.createdRange);
  return params;
}

// ---------------------------------------------------------------------------
// Invites
// GET /admin/invites: status, q, createdFrom/To, expiresFrom/To
// ---------------------------------------------------------------------------
export type InvitesFilterInput = {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
  createdRange?: string;
  expiresRange?: string;
};

export function buildInvitesParams(input: InvitesFilterInput = {}): ListQueryParams {
  const params = baseParams(input.page, input.limit);
  setText(params, 'status', input.status);
  setText(params, 'q', input.q);
  setDateRange(params, 'created', input.createdRange);
  setDateRange(params, 'expires', input.expiresRange);
  return params;
}

// ---------------------------------------------------------------------------
// Roles / Departments / generic search-only lists
// ---------------------------------------------------------------------------
export type SearchFilterInput = {
  page?: number;
  limit?: number;
  q?: string;
};

export function buildRolesParams(input: SearchFilterInput = {}): ListQueryParams {
  const params = baseParams(input.page, input.limit);
  setText(params, 'q', input.q);
  return params;
}

export const buildDepartmentsParams = buildRolesParams;

// ---------------------------------------------------------------------------
// Audit logs
// GET /admin/audit-logs: actorType, action, targetType, targetId, createdFrom/To
// ---------------------------------------------------------------------------
export type AuditLogsFilterInput = {
  page?: number;
  limit?: number;
  action?: string;
  actorType?: string;
  targetType?: string;
  targetId?: string;
  createdRange?: string;
};

export function buildAuditLogsParams(input: AuditLogsFilterInput = {}): ListQueryParams {
  const params = baseParams(input.page, input.limit);
  setText(params, 'action', input.action);
  setText(params, 'actorType', input.actorType);
  setText(params, 'targetType', input.targetType);
  setText(params, 'targetId', input.targetId);
  setDateRange(params, 'created', input.createdRange);
  return params;
}

// ---------------------------------------------------------------------------
// Loans (ingested loan catalog)
// GET /admin/loans: agency, product, q, disbursedFrom/To, createdFrom/To
// ---------------------------------------------------------------------------
export type LoansFilterInput = {
  page?: number;
  limit?: number;
  q?: string;
  agency?: string;
  product?: string;
  disbursedRange?: string;
  createdRange?: string;
};

export function buildLoansParams(input: LoansFilterInput = {}): ListQueryParams {
  const params = baseParams(input.page, input.limit);
  setText(params, 'q', input.q);
  setText(params, 'agency', input.agency);
  setText(params, 'product', input.product);
  setDateRange(params, 'disbursed', input.disbursedRange);
  setDateRange(params, 'created', input.createdRange);
  return params;
}

// ---------------------------------------------------------------------------
// IPPIS records
// GET /admin/ippis-records: agency, employeeStatus, department, grade, q,
// hireDateFrom/To, createdFrom/To
// ---------------------------------------------------------------------------
export type IppisFilterInput = {
  page?: number;
  limit?: number;
  q?: string;
  agency?: string;
  employeeStatus?: string;
  department?: string;
  grade?: string;
  hireDateRange?: string;
  createdRange?: string;
};

export function buildIppisParams(input: IppisFilterInput = {}): ListQueryParams {
  const params = baseParams(input.page, input.limit);
  setText(params, 'q', input.q);
  setText(params, 'agency', input.agency);
  setText(params, 'employeeStatus', input.employeeStatus);
  setText(params, 'department', input.department);
  setText(params, 'grade', input.grade);
  setDateRange(params, 'hireDate', input.hireDateRange);
  setDateRange(params, 'created', input.createdRange);
  return params;
}

// ---------------------------------------------------------------------------
// Loan requests
// GET /admin/loan-requests: clientId, status, type, createdFrom/To,
// disbursedFrom/To
// ---------------------------------------------------------------------------
export type LoanRequestsFilterInput = {
  page?: number;
  limit?: number;
  clientId?: string;
  status?: string;
  type?: string;
  createdRange?: string;
  disbursedRange?: string;
};

export function buildLoanRequestsParams(input: LoanRequestsFilterInput = {}): ListQueryParams {
  const params = baseParams(input.page, input.limit);
  setText(params, 'clientId', input.clientId);
  setText(params, 'status', input.status);
  setText(params, 'type', input.type);
  setDateRange(params, 'created', input.createdRange);
  setDateRange(params, 'disbursed', input.disbursedRange);
  return params;
}

// ---------------------------------------------------------------------------
// Client loans
// GET /admin/client-loans: clientId (required), status, agency,
// disbursedFrom/To. The API has no free-text `q` filter.
// ---------------------------------------------------------------------------
export type ClientLoansFilterInput = {
  page?: number;
  limit?: number;
  clientId?: string;
  status?: string;
  agency?: string;
  disbursedRange?: string;
};

export function buildClientLoansParams(input: ClientLoansFilterInput = {}): ListQueryParams {
  const params = baseParams(input.page, input.limit);
  setText(params, 'clientId', input.clientId);
  setText(params, 'status', input.status);
  setText(params, 'agency', input.agency);
  setDateRange(params, 'disbursed', input.disbursedRange);
  return params;
}

// ---------------------------------------------------------------------------
// Document batches
// GET /admin/documents/batches: documentType, status, q, createdFrom/To,
// completedFrom/To
// ---------------------------------------------------------------------------
export type DocumentBatchesFilterInput = {
  page?: number;
  limit?: number;
  documentType?: string;
  status?: string;
  q?: string;
  createdRange?: string;
  completedRange?: string;
};

export function buildDocumentBatchesParams(input: DocumentBatchesFilterInput = {}): ListQueryParams {
  const params = baseParams(input.page, input.limit);
  setText(params, 'documentType', input.documentType);
  setText(params, 'status', input.status);
  setText(params, 'q', input.q);
  setDateRange(params, 'created', input.createdRange);
  setDateRange(params, 'completed', input.completedRange);
  return params;
}

// ---------------------------------------------------------------------------
// Agent recruitment applications
// GET /admin/agent-recruitment-applications: status, q, createdFrom/To
// ---------------------------------------------------------------------------
export type RecruitmentApplicationsFilterInput = {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
  createdRange?: string;
};

export function buildRecruitmentApplicationsParams(
  input: RecruitmentApplicationsFilterInput = {},
): ListQueryParams {
  const params = baseParams(input.page, input.limit);
  setText(params, 'status', input.status);
  setText(params, 'q', input.q);
  setDateRange(params, 'created', input.createdRange);
  return params;
}

// ---------------------------------------------------------------------------
// Reconciliation
// GET /admin/reconciliation: agency, status, period, generatedFrom/To
// ---------------------------------------------------------------------------
export type ReconciliationFilterInput = {
  page?: number;
  limit?: number;
  agency?: string;
  status?: string;
  period?: string;
  generatedRange?: string;
};

export function buildReconciliationParams(input: ReconciliationFilterInput = {}): ListQueryParams {
  const params = baseParams(input.page, input.limit);
  setText(params, 'agency', input.agency);
  setText(params, 'status', input.status);
  setText(params, 'period', input.period);
  setDateRange(params, 'generated', input.generatedRange);
  return params;
}

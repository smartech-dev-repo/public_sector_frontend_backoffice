import * as XLSX from 'xlsx';
import { ippis_api } from '@/app/api_factory/modules/ippis';

export interface UploadFilterValues {
  search: string;
  report: string;
  status: string;
  period: string;
  dateRange: string;
}

export const EMPTY_FILTERS: UploadFilterValues = { search: '', report: 'all', status: 'all', period: '', dateRange: '' };

export const REPORTS = [
  { value: 'IPPIS_BROADSHEET', label: 'IPPIS Broadsheet' },
  { value: 'REPAYMENT_SCHEDULE', label: 'Repayment Schedule' },
];

export const STATUS_LABELS: Record<string, string> = {
  ANALYZING: 'Checking',
  AWAITING_CONFIRMATION: 'Awaiting review',
  PENDING: 'Queued',
  PROCESSING: 'Merging',
  COMPLETED: 'Merged',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
};

const EXPORT_PAGE_SIZE = 100;

export function buildBatchParams(documentType: string, filters: UploadFilterValues) {
  const params: Record<string, string> = { documentType };
  const [from, to] = filters.dateRange ? filters.dateRange.split(' to ') : [];
  if (filters.search.trim()) params.q = filters.search.trim();
  if (filters.status !== 'all') params.status = filters.status;
  if (filters.period) params.period = filters.period;
  if (from) params.createdFrom = `${from}T00:00:00.000Z`;
  if (from) params.createdTo = `${to || from}T23:59:59.999Z`;
  return params;
}

export function formatPeriod(batch: any): string {
  const [year, month] = (batch.period || '').split('-');
  const date = year && month ? new Date(Number(year), Number(month) - 1) : new Date(batch.createdAt);
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
}

export function formatUploadedOn(batch: any): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(batch.createdAt));
}

async function fetchAllBatches(documentType: string, filters: UploadFilterValues): Promise<any[]> {
  const batches: any[] = [];
  let totalPages = 1;
  for (let page = 1; page <= totalPages; page++) {
    const res: any = await ippis_api.getDocumentBatches({ ...buildBatchParams(documentType, filters), page, limit: EXPORT_PAGE_SIZE });
    if (res?.type === 'ERROR') throw new Error('Could not load uploads');
    batches.push(...(res.data?.data ?? []));
    totalPages = res.data?.meta?.totalPages ?? 1;
  }
  return batches;
}

const toRow = (batch: any) => ({
  Month: formatPeriod(batch),
  Status: STATUS_LABELS[batch.status] ?? batch.status,
  'File Name': batch.originalFileName,
  'Saved As': batch.storedFileName ?? '',
  'Uploaded By': batch.uploadedBy?.fullName ?? '',
  'Uploaded On': formatUploadedOn(batch),
  'Rows Processed': batch.rowsProcessed,
  'Rows Added': batch.rowsCreated,
  'Rows Updated': batch.rowsUpdated,
  'Rows Skipped': batch.rowsSkipped,
});

// Returns how many uploads were written, so the caller can report an empty result.
export async function exportUploads(documentTypes: string[], fileLabel: string, filters: UploadFilterValues): Promise<number> {
  const workbook = XLSX.utils.book_new();
  let total = 0;
  for (const documentType of documentTypes) {
    const batches = await fetchAllBatches(documentType, filters);
    total += batches.length;
    const label = REPORTS.find((report) => report.value === documentType)?.label ?? documentType;
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(batches.map(toRow)), label);
  }
  if (total > 0) {
    XLSX.writeFile(workbook, `${fileLabel}-uploads_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
  return total;
}

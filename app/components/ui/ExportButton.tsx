"use client";

import { useState } from 'react';
import { Download } from 'lucide-react';
import * as xlsx from 'xlsx';
import { auditLogs_api } from '@/app/api_factory/modules/auditLogs';
import { useToast } from '@/app/composables/useToast';

export interface ExportColumn<Row> {
 header: string;
 value: (row: Row) => string | number | boolean | null | undefined;
}

interface ExportButtonProps<Row> {
 /** Fetches one page with the list's current filters. Resolves to the API response. */
 fetchPage: (page: number, limit: number) => Promise<any>;
 columns: ExportColumn<Row>[];
 /** File name without the date or extension, e.g. "Loan_Requests". */
 fileName: string;
 /** What the audit trail records was exported, e.g. "Loan requests". */
 resource: string;
 label?: string;
}

const PAGE_SIZE = 100;
// A guard against a runaway export; far above any list here today.
const MAX_ROWS = 20000;

const rowsOf = (res: any): any[] => {
 if (!res || res.type === 'ERROR') throw new Error('fetch failed');
 if (Array.isArray(res.data)) return res.data;
 return Array.isArray(res.data?.data) ? res.data.data : [];
};

/**
 * Exports every record matching the list's current filters, not just the page
 * on screen, to an Excel file, and records the export in the audit trail.
 */
export default function ExportButton<Row>({ fetchPage, columns, fileName, resource, label = 'Export' }: ExportButtonProps<Row>) {
 const { addToast } = useToast();
 const [busy, setBusy] = useState(false);

 const run = async () => {
  setBusy(true);
  try {
   const rows: Row[] = [];
   for (let page = 1; rows.length < MAX_ROWS; page += 1) {
    const res = await fetchPage(page, PAGE_SIZE);
    const batch = rowsOf(res);
    rows.push(...batch);
    const total = res?.data?.meta?.total;
    if (batch.length < PAGE_SIZE || (typeof total === 'number' && rows.length >= total)) break;
   }
   if (rows.length === 0) {
    addToast('Nothing matches these filters, so there is nothing to export', 'info');
    return;
   }
   const sheet = xlsx.utils.json_to_sheet(
    rows.map((row) => Object.fromEntries(columns.map((column) => [column.header, column.value(row) ?? '']))),
   );
   const book = xlsx.utils.book_new();
   xlsx.utils.book_append_sheet(book, sheet, resource.slice(0, 31));
   xlsx.writeFile(book, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
   auditLogs_api.reportDataAccess({ kind: 'export', resource, recordCount: rows.length });
   addToast(`Exported ${rows.length.toLocaleString()} ${rows.length === 1 ? 'record' : 'records'}`, 'success');
  } catch {
   addToast('The export failed. Please try again.', 'error');
  } finally {
   setBusy(false);
  }
 };

 return (
  <button
   type="button"
   onClick={run}
   disabled={busy}
   className="h-10 inline-flex items-center gap-2 px-4 rounded-full border border-border bg-card text-[13px] font-semibold text-foreground hover:bg-muted/50 disabled:opacity-60 transition-colors"
  >
   <Download className="w-4 h-4" />
   {busy ? 'Exporting…' : label}
  </button>
 );
}

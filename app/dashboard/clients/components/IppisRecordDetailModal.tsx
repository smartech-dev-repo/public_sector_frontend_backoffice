"use client";

import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import SensitiveValue from '@/app/components/ui/SensitiveValue';

const EMPTY = <span className="text-muted-foreground">—</span>;

export function formatIppisAmount(value: unknown): ReactNode {
  return value === null || value === undefined ? EMPTY : `₦${Number(value).toLocaleString()}`;
}

// Broadsheet dates are stored at UTC midnight; a local format could show the day before.
export function formatIppisDate(value: unknown): ReactNode {
  if (!value) return EMPTY;
  return new Date(String(value)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export function isActiveEmployee(employeeStatus: unknown): boolean {
  return /^active/i.test(String(employeeStatus ?? '').trim());
}

const text = (value: unknown): ReactNode => (value === null || value === undefined || value === '' ? EMPTY : String(value));
const sensitive = (value: unknown): ReactNode => <SensitiveValue value={value as string} allowCopy />;
const dateTime = (value: unknown): ReactNode =>
  value ? new Date(String(value)).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : EMPTY;

// Spreadsheet headers reach rawFields lowercased.
const toLabel = (header: string) => header.replace(/[_\s]+/g, ' ').trim().replace(/\b\w/g, (letter) => letter.toUpperCase());

function Section({ title, rows }: { title: string; rows: [string, ReactNode][] }) {
  return (
    <section>
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{title}</h4>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 p-4 rounded-xl border border-border">
        {rows.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-[11px] text-muted-foreground">{label}</dt>
            <dd className="text-sm font-medium text-foreground break-words">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function IppisRecordDetailModal({ record, onClose }: { record: any; onClose: () => void }) {
  useEffect(() => {
    if (!record) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [record, onClose]);

  if (!record || typeof document === 'undefined') return null;

  const extraFields = Object.entries(record.rawFields ?? {});

  return createPortal(
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />

      <div role="dialog" aria-modal="true" aria-label={`IPPIS record for ${record.employeeName}`} className="relative bg-card rounded-2xl border border-border w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-border">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-foreground break-words">{record.employeeName}</h3>
            <p className="text-xs text-muted-foreground mt-1">{record.agency} · {record.staffId}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          <Section title="Employment" rows={[
            ['Staff ID', text(record.staffId)],
            ['Agency', text(record.agency)],
            ['Employee Status', text(record.employeeStatus)],
            ['Job Title', text(record.jobTitle)],
            ['Department', text(record.department)],
            ['Sub Organization', text(record.subOrganization)],
            ['Grade', text(record.grade)],
            ['Step', text(record.step)],
            ['Hire Date', formatIppisDate(record.hireDate)],
            ['Date Terminated', formatIppisDate(record.dateTerminated)],
            ['Legacy ID', text(record.legacyId)],
          ]} />

          <Section title="Pay" rows={[
            ['Salary', formatIppisAmount(record.salary)],
            ['Payment 3 Months Ago', formatIppisAmount(record.paymentThreeMonthsAgo)],
            ['Payment 2 Months Ago', formatIppisAmount(record.paymentTwoMonthsAgo)],
            ['Payment Last Month', formatIppisAmount(record.paymentLastMonth)],
          ]} />

          <Section title="Personal" rows={[
            ['Date of Birth', formatIppisDate(record.dateOfBirth)],
            ['Gender', text(record.gender)],
            ['Marital Status', text(record.maritalStatus)],
            ['Telephone Number', sensitive(record.phone)],
            ['BVN', sensitive(record.bvn)],
          ]} />

          <Section title="Bank and Pension" rows={[
            ['Bank Name', text(record.bankName)],
            ['Account Number', sensitive(record.accountNumber)],
            ['PFA Name', text(record.pfaName)],
            ['PIN Number', sensitive(record.pinNumber)],
          ]} />

          {extraFields.length > 0 && (
            <Section
              title="Other Uploaded Columns"
              rows={extraFields.map(([header, value]) => [toLabel(header), typeof value === 'object' ? text(JSON.stringify(value)) : text(value)])}
            />
          )}

          <Section title="Record" rows={[
            ['First Uploaded', dateTime(record.createdAt)],
            ['Last Updated', dateTime(record.updatedAt)],
          ]} />
        </div>
      </div>
    </div>,
    document.body
  );
}

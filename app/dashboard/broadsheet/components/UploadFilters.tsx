"use client";

import FilterBar from '@/app/components/ui/FilterBar';
import { REPORTS, STATUS_LABELS, type UploadFilterValues } from './uploadBatches';

interface UploadFiltersProps {
  value: UploadFilterValues;
  onChange: (value: UploadFilterValues) => void;
}

export default function UploadFilters({ value, onChange }: UploadFiltersProps) {
  return (
    <FilterBar
      className="mb-0"
      search={{ value: value.search, onChange: (search) => onChange({ ...value, search }), placeholder: 'File name or uploader' }}
      filters={[
        { key: 'report', label: 'Report', type: 'select', value: value.report, emptyValue: 'all', options: REPORTS, onChange: (report) => onChange({ ...value, report }) },
        { key: 'status', label: 'Status', type: 'select', value: value.status, emptyValue: 'all', options: Object.entries(STATUS_LABELS).map(([status, label]) => ({ value: status, label })), onChange: (status) => onChange({ ...value, status }) },
        { key: 'period', label: 'Repayment Month', type: 'month', value: value.period, onChange: (period) => onChange({ ...value, period }) },
        { key: 'uploaded', label: 'Uploaded', type: 'dateRange', value: value.dateRange, onChange: (dateRange) => onChange({ ...value, dateRange }) },
      ]}
    />
  );
}

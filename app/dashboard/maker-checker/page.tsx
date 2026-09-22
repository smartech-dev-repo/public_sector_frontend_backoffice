"use client";

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLoans } from '@/app/composables/modules/useLoans';
import { DataTable } from '@/components/data-display/data-table';
import { EmptyState } from '@/components/feedback/empty-state';
import { Badge } from '@/components/ui/badge';

export default function MakerCheckerPage() {
  const { loading, error, loanRequests, fetchLoanRequests } = useLoans();

  useEffect(() => {
    fetchLoanRequests({ status: 'CONFIRMED' }); // Typically, maker-checker reviews confirmed requests or pending
  }, [fetchLoanRequests]);

  const pendingCount = useMemo(() => loanRequests.filter((lr: any) => lr.status === 'CONFIRMED' || lr.status === 'PENDING').length, [loanRequests]);
  const approvedCount = useMemo(() => loanRequests.filter((lr: any) => lr.status === 'APPROVED').length, [loanRequests]);

  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: 'Application Ref (ID)',
      cell: ({ row }: any) => <span className="font-mono text-slate-600">{row.original.id}</span>
    },
    {
      accessorKey: 'customerName',
      header: 'Customer Name',
      cell: ({ row }: any) => <span className="font-medium text-slate-800">{row.original.client?.firstName} {row.original.client?.lastName}</span>
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }: any) => <span className="font-medium text-slate-800">₦{Number(row.original.amount || 0).toLocaleString()}</span>
    },
    {
      accessorKey: 'tenor',
      header: 'Tenor (Months)',
      cell: ({ row }: any) => <span className="text-slate-600">{row.original.tenor}</span>
    },
    {
      accessorKey: 'createdAt',
      header: 'Date Submitted',
      cell: ({ row }: any) => <span className="text-slate-600">{new Date(row.original.createdAt).toLocaleDateString()}</span>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const s = row.original.status;
        return (
          <Badge variant={s === 'PENDING' ? 'warning' : s === 'APPROVED' ? 'success' : s === 'REJECTED' ? 'error' : 'default'}>
            {s}
          </Badge>
        );
      }
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }: any) => (
        <div className="text-right">
          <Link href={`/dashboard/loan-requests/${row.original.id}`} className="text-emerald-600 hover:text-emerald-800 font-medium text-sm">
            Review Request
          </Link>
        </div>
      )
    }
  ], []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Loan Requests (Maker/Checker)</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Pending Review</div>
          <div className="text-3xl text-foreground font-semibold">{pendingCount}</div>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Approved</div>
          <div className="text-3xl text-success font-semibold">{approvedCount}</div>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Total Requests</div>
          <div className="text-3xl text-success font-semibold">{loanRequests.length}</div>
        </div>
      </div>
      
      {/* Queue Table */}
      {!loading && loanRequests.length === 0 ? (
        <EmptyState 
          title="No loan requests found" 
          description="There are currently no loan requests requiring review." 
        />
      ) : (
        <DataTable
          columns={columns}
          data={loanRequests}
          loading={loading}
          filterColumnId="customerName"
          filterPlaceholder="Search by name..."
        />
      )}
    </div>
  );
}

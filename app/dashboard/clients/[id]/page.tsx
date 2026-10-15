"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useClients } from '@/app/composables/modules/useClients';
import { useLoans } from '@/app/composables/modules/useLoans';
import { useToast } from '@/app/composables/useToast';
import { useConfirm } from '@/app/composables/useConfirm';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import ButtonLoader from '@/app/components/ui/ButtonLoader';
import { createPortal } from 'react-dom';
import Link from 'next/link';

export default function ClientWalletPage() {
 const { id } = useParams();
 const clientId = typeof id === 'string' ? id : '';
 
 const { 
  loading, 
  error, 
  getClientById, 
  getClientWallet, 
  creditClientWallet, 
  debitClientWallet, 
  getClientActivities, 
  getClientOnboardingStatus,
  approveClient,
  retryClient,
  revokeClientSessions
 } = useClients();
 const { fetchClientLoans, clientLoans, getClientLoanRepaymentPlan } = useLoans();
 const { addToast } = useToast();
 const { confirm } = useConfirm();

 const [client, setClient] = useState<any>(null);
 const [wallet, setWallet] = useState<any>(null);
 const [onboardingStatus, setOnboardingStatus] = useState<any>(null);
 const [onboardingLoading, setOnboardingLoading] = useState(false);
 const [activities, setActivities] = useState<any[]>([]);
 const [activitiesLoading, setActivitiesLoading] = useState(false);
 const [loansLoading, setLoansLoading] = useState(false);
 const [activeTab, setActiveTab] = useState<'profile' | 'onboarding' | 'wallet' | 'loans' | 'activities'>('profile');
 
 const [showCreditModal, setShowCreditModal] = useState(false);
 const [showDebitModal, setShowDebitModal] = useState(false);
 const [showRetryModal, setShowRetryModal] = useState(false);
 const [retryNote, setRetryNote] = useState('');
 const [amount, setAmount] = useState('');
 const [submitting, setSubmitting] = useState(false);

 // Repayment plan state
 const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);
 const [repaymentPlan, setRepaymentPlan] = useState<any>(null);
 const [repaymentLoading, setRepaymentLoading] = useState(false);

 useEffect(() => {
  if (clientId) {
   loadData();
  }
 }, [clientId]);

 const loadData = async () => {
  try {
   const clientData = await getClientById(clientId);
   setClient(clientData);
   const walletData = await getClientWallet(clientId);
   setWallet(walletData);
  } catch (e: any) {
   addToast('Failed to load client data', 'error');
  }
 };

 const loadActivities = async () => {
  setActivitiesLoading(true);
  try {
   const data = await getClientActivities(clientId);
   let list = Array.isArray(data) ? data : (data?.data || data?.activities || []);
   list = Array.isArray(list) ? list : [];
   setActivities(list);
  } catch (e: any) {
   addToast('Failed to load client activities', 'error');
  } finally {
   setActivitiesLoading(false);
  }
 };

 const loadClientLoans = async () => {
  setLoansLoading(true);
  try {
   await fetchClientLoans({ clientId });
  } catch (e: any) {
   addToast('Failed to load client loans', 'error');
  } finally {
   setLoansLoading(false);
  }
 };

 const loadOnboardingStatus = async () => {
  setOnboardingLoading(true);
  try {
   const data = await getClientOnboardingStatus(clientId);
   setOnboardingStatus(data?.data || data);
  } catch (e: any) {
   addToast('Failed to load onboarding status', 'error');
  } finally {
   setOnboardingLoading(false);
  }
 };

 const handleTabChange = (tab: 'profile' | 'onboarding' | 'wallet' | 'loans' | 'activities') => {
  setActiveTab(tab);
  if (tab === 'activities' && activities.length === 0) {
   loadActivities();
  }
  if (tab === 'loans' && clientLoans.length === 0) {
   loadClientLoans();
  }
  if (tab === 'onboarding' && !onboardingStatus) {
   loadOnboardingStatus();
  }
 };

 const handleViewRepayment = async (loanId: string) => {
  if (expandedLoanId === loanId) {
   setExpandedLoanId(null);
   setRepaymentPlan(null);
   return;
  }
  setExpandedLoanId(loanId);
  setRepaymentLoading(true);
  try {
   const data = await getClientLoanRepaymentPlan(loanId);
   setRepaymentPlan(data);
  } catch (e: any) {
   addToast('Failed to load repayment plan', 'error');
   setRepaymentPlan(null);
  } finally {
   setRepaymentLoading(false);
  }
 };

 const handleCredit = async () => {
  if (!amount || isNaN(Number(amount))) {
   addToast('Please enter a valid amount', 'error');
   return;
  }
  const confirmed = await confirm({
   title: 'Confirm Credit',
   message: `Are you sure you want to credit ₦${Number(amount).toLocaleString()} to this client's wallet?`,
   confirmText: 'Credit',
  });
  if (!confirmed) return;
  setSubmitting(true);
  try {
   await creditClientWallet(clientId, { amount: Number(amount) });
   addToast('Wallet credited successfully', 'success');
   setShowCreditModal(false);
   setAmount('');
   loadData();
  } catch (e: any) {
   addToast(e?.response?.data?.message || 'Failed to credit wallet', 'error');
  } finally {
   setSubmitting(false);
  }
 };

 const handleDebit = async () => {
  if (!amount || isNaN(Number(amount))) {
   addToast('Please enter a valid amount', 'error');
   return;
  }
  const confirmed = await confirm({
   title: 'Confirm Debit',
   message: `Are you sure you want to debit ₦${Number(amount).toLocaleString()} from this client's wallet?`,
   confirmText: 'Debit',
  });
  if (!confirmed) return;
  setSubmitting(true);
  try {
   await debitClientWallet(clientId, { amount: Number(amount) });
   addToast('Wallet debited successfully', 'success');
   setShowDebitModal(false);
   setAmount('');
   loadData();
  } catch (e: any) {
   addToast(e?.response?.data?.message || 'Failed to debit wallet', 'error');
  } finally {
   setSubmitting(false);
  }
 };

 const handleApprove = async () => {
  const isConfirmed = await confirm({
   title: 'Approve Client',
   message: 'Are you sure you want to approve this client onboarding?',
   confirmText: 'Approve Client'
  });
  if (!isConfirmed) return;
  setSubmitting(true);
  try {
   await approveClient(clientId);
   addToast('Client approved successfully', 'success');
   loadData();
  } catch (e: any) {
   addToast(e?.response?.data?.message || 'Failed to approve client', 'error');
  } finally {
   setSubmitting(false);
  }
 };

 const handleRetrySubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  try {
   await retryClient(clientId, { note: retryNote.trim() || 'Verification retry requested by administrator' });
   addToast('Verification retry requested successfully', 'success');
   setShowRetryModal(false);
   setRetryNote('');
   loadData();
  } catch (e: any) {
   addToast(e?.response?.data?.message || 'Failed to request retry', 'error');
  } finally {
   setSubmitting(false);
  }
 };

 const handleRevokeSessions = async () => {
  const isConfirmed = await confirm({
   title: 'Revoke Sessions',
   message: 'Are you sure you want to revoke all active sessions for this client?',
   confirmText: 'Revoke Sessions'
  });
  if (!isConfirmed) return;
  setSubmitting(true);
  try {
   await revokeClientSessions(clientId);
   addToast('All sessions for this client revoked successfully', 'success');
  } catch (e: any) {
   addToast(e?.response?.data?.message || 'Failed to revoke sessions', 'error');
  } finally {
   setSubmitting(false);
  }
 };

 const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
   case 'ACTIVE':
   case 'DISBURSED':
   case 'MATCHED':
   case 'VERIFIED':
    return 'bg-emerald-100 text-emerald-800';
   case 'PENDING':
   case 'PENDING_IPPIS':
   case 'UPCOMING':
   case 'MANUAL_REVIEW':
    return 'bg-amber-100 text-amber-800';
   case 'OVERDUE':
   case 'NO_DEDUCTION_FOUND':
   case 'UNDER_PAID':
   case 'REJECTED':
    return 'bg-rose-100 text-rose-800';
   case 'OVER_PAID':
    return 'bg-blue-100 text-blue-800';
   case 'COMPLETED':
   case 'SETTLED':
    return 'bg-muted/50 text-foreground';
   default:
    return 'bg-muted/50 text-muted-foreground';
  }
 };

 const tabs = [
  { key: 'profile' as const, label: 'Profile' },
  { key: 'onboarding' as const, label: 'Onboarding' },
  { key: 'wallet' as const, label: 'Wallet' },
  { key: 'loans' as const, label: 'Loans' },
  { key: 'activities' as const, label: 'Activities' },
 ];

 return (
  <main className="w-full">
   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
    <div className="flex items-center gap-4">
     <Link href="/dashboard/clients" className="text-muted-foreground hover:text-foreground transition-colors">
      &larr; Back to Clients
     </Link>
     <h1 className="text-2xl font-semibold text-foreground">Client Details</h1>
    </div>
    {client && (
     <div className="flex flex-wrap items-center gap-2">
      {client.status === 'MANUAL_REVIEW' && (
       <>
        <button
         onClick={handleApprove}
         disabled={submitting}
         className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 min-w-[120px]"
        >
         <ButtonLoader loading={submitting} loadingText="Approving...">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          Approve Client
         </ButtonLoader>
        </button>
        <button
         onClick={() => setShowRetryModal(true)}
         disabled={submitting}
         className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
         <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
         Request Retry
        </button>
       </>
      )}
      <button
       onClick={handleRevokeSessions}
       disabled={submitting}
       className="px-3.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50 min-w-[130px]"
      >
       <ButtonLoader loading={submitting} loadingText="Revoking...">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
        Revoke Sessions
       </ButtonLoader>
      </button>
     </div>
    )}
   </div>

   {loading && !client && <PulseLoader />}
   {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}

   {!loading && client && (
    <>
     {/* Tabs */}
     <div className="flex gap-1 mb-3 bg-muted/50 p-1 rounded-xl w-fit">
      {tabs.map((tab) => (
       <button
        key={tab.key}
        onClick={() => handleTabChange(tab.key)}
        className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
         activeTab === tab.key
          ? 'bg-card text-emerald-700 '
          : 'text-muted-foreground hover:text-foreground/90'
        }`}
       >
        {tab.label}
       </button>
      ))}
     </div>

     {/* Profile Tab */}
     {activeTab === 'profile' && (
      <div className="bg-card p-6 rounded-2xl border border-border">
       <h2 className="text-lg font-semibold text-foreground mb-4">Profile</h2>
       <div className="space-y-3">
        <p><span className="text-muted-foreground font-medium">Name:</span> {client.onboarding?.employeeName || [client.firstName, client.lastName].filter(Boolean).join(' ') || client.name || 'Unnamed Client'}</p>
        <p><span className="text-muted-foreground font-medium">Email:</span> {client.email || '--'}</p>
        <p><span className="text-muted-foreground font-medium">Phone:</span> {client.phone || client.phoneNumber || client.onboarding?.identityPhoneNumber || '--'}</p>
        <p><span className="text-muted-foreground font-medium">Status:</span> <span className="px-2.5 py-1 bg-muted/50 rounded-full text-xs font-semibold">{client.status}</span></p>
        {client.onboarding?.agency && (
         <p><span className="text-muted-foreground font-medium">Agency:</span> {client.onboarding.agency}</p>
        )}
       </div>
      </div>
     )}

     {/* Onboarding Tab */}
     {activeTab === 'onboarding' && (
      <div className="bg-card p-6 rounded-2xl border border-border">
       <h2 className="text-lg font-semibold text-foreground mb-4">Onboarding Status</h2>
       {onboardingLoading ? (
        <PulseLoader />
       ) : onboardingStatus ? (
        <div className="space-y-6">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
           <p className="text-xs text-muted-foreground mb-1">Email Verified</p>
           <div className={`text-sm font-semibold ${onboardingStatus.isEmailVerified ? 'text-emerald-600' : 'text-rose-600'}`}>
            {onboardingStatus.isEmailVerified ? 'Yes' : 'No'}
           </div>
          </div>
          <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
           <p className="text-xs text-muted-foreground mb-1">Phone Verified</p>
           <div className={`text-sm font-semibold ${onboardingStatus.isPhoneVerified ? 'text-emerald-600' : 'text-rose-600'}`}>
            {onboardingStatus.isPhoneVerified ? 'Yes' : 'No'}
           </div>
          </div>
          <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
           <p className="text-xs text-muted-foreground mb-1">BVN Verified</p>
           <div className={`text-sm font-semibold ${onboardingStatus.isBvnVerified ? 'text-emerald-600' : 'text-rose-600'}`}>
            {onboardingStatus.isBvnVerified ? 'Yes' : 'No'}
           </div>
          </div>
          <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
           <p className="text-xs text-muted-foreground mb-1">Face Match</p>
           <div className={`text-sm font-semibold ${onboardingStatus.isFaceMatched ? 'text-emerald-600' : 'text-rose-600'}`}>
            {onboardingStatus.isFaceMatched ? 'Matched' : 'Pending'}
           </div>
          </div>
         </div>
         
         <div className="p-4 bg-muted/30 rounded-xl border border-border/50 space-y-3">
          <h3 className="font-medium text-foreground">Next Steps / Outstanding</h3>
          {(!onboardingStatus.isEmailVerified || !onboardingStatus.isPhoneVerified || !onboardingStatus.isBvnVerified || !onboardingStatus.isFaceMatched) ? (
           <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            {!onboardingStatus.isEmailVerified && <li>Client needs to verify their email address.</li>}
            {!onboardingStatus.isPhoneVerified && <li>Client needs to verify their phone number.</li>}
            {!onboardingStatus.isBvnVerified && <li>Client needs to complete BVN verification.</li>}
            {!onboardingStatus.isFaceMatched && <li>Client needs to complete biometric face match.</li>}
           </ul>
          ) : (
           <p className="text-sm text-emerald-600 font-medium">All onboarding steps have been successfully completed.</p>
          )}
         </div>
        </div>
       ) : (
        <EmptyState title="No Onboarding Data" description="We couldn't retrieve onboarding status for this client." />
       )}
      </div>
     )}

     {/* Wallet Tab */}
     {activeTab === 'wallet' && (
      <div className="bg-card p-6 rounded-2xl border border-border">
       <h2 className="text-lg font-semibold text-foreground mb-4">Wallet</h2>
       {wallet ? (
        <div className="space-y-3">
         <div>
          <p className="text-muted-foreground text-sm font-medium mb-1">Available Balance</p>
          <p className="text-3xl font-bold text-foreground">₦{wallet.balance?.toLocaleString() || 0}</p>
         </div>
         <div className="flex gap-3">
          <button onClick={() => setShowCreditModal(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">Credit Wallet</button>
          <button onClick={() => setShowDebitModal(true)} className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors">Debit Wallet</button>
         </div>
        </div>
       ) : (
        <p className="text-muted-foreground text-sm">No wallet information available.</p>
       )}
      </div>
     )}

     {/* Loans Tab */}
     {activeTab === 'loans' && (
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
       <div className="px-6 py-4 border-b border-border flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">Client Loans</h2>
        <button onClick={loadClientLoans} className="text-sm text-emerald-600 hover:text-emerald-800 font-medium transition-colors">Refresh</button>
       </div>
       {loansLoading && <PulseLoader />}
       
       {!loansLoading && (

        <div className="overflow-x-auto">
         <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
           <tr>
            <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Loan ID</th>
            <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Amount</th>
            <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Outstanding</th>
            <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Tenor</th>
            <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Status</th>
            <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Disbursed At</th>
            <th className="px-4 py-4 text-right text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Actions</th>
           </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
 {!loansLoading && clientLoans.length === 0 ? (<tr><td colSpan={13} className="p-8"><div className="flex justify-center w-full"><EmptyState title="No loans found for this client." /></div></td></tr>) : (clientLoans.map((loan: any) => (
            <>
             <tr key={loan.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground font-mono">{loan.id?.slice(0, 8)}...</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground font-medium">₦{loan.amount?.toLocaleString() || loan.principal?.toLocaleString() || '0'}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">₦{loan.outstandingBalance?.toLocaleString() || loan.outstanding?.toLocaleString() || '0'}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{loan.tenor || loan.tenorMonths || '-'} months</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm">
               <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                {loan.status}
               </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground font-mono">
               {loan.disbursementDate ? new Date(loan.disbursementDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm">
               <button
                onClick={() => handleViewRepayment(loan.id)}
                className="text-emerald-600 hover:text-emerald-800 font-medium transition-colors text-sm"
               >
                {expandedLoanId === loan.id ? 'Hide Plan' : 'View Plan'}
               </button>
              </td>
             </tr>
             {/* Expandable Repayment Plan */}
             {expandedLoanId === loan.id && (
              <tr key={`${loan.id}-plan`}>
               <td colSpan={7} className="px-0 py-0 bg-muted/30">
                <div className="px-6 py-4">
                 <h4 className="text-sm font-semibold text-foreground/90 mb-3">Repayment Schedule</h4>
                 {repaymentLoading && <PulseLoader />}
                 {!repaymentLoading && !repaymentPlan && (
                  <p className="text-sm text-muted-foreground">No repayment plan available.</p>
                 )}
                 {!repaymentLoading && repaymentPlan && (
                  <div className="overflow-x-auto rounded-lg border border-border">
                   <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
                     <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase">Due Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase">Expected</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase">Actual</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase">Variance</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase">Status</th>
                     </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-card">
                     {(repaymentPlan?.schedule || repaymentPlan?.repaymentPlan || repaymentPlan?.periods || []).map((item: any, index: number) => (
                      <tr key={index} className="hover:bg-muted/30 transition-colors">
                       <td className="px-4 py-3 text-muted-foreground text-sm">{item.periodNumber || item.installmentNumber || index + 1}</td>
                       <td className="px-4 py-3 text-muted-foreground font-mono text-sm">
                        {item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                       </td>
                       <td className="px-4 py-3 text-foreground font-medium text-sm">₦{(item.expectedAmount || item.amount || item.installmentAmount)?.toLocaleString() || '0'}</td>
                       <td className="px-4 py-3 text-muted-foreground text-sm">{item.actualAmount != null ? `₦${item.actualAmount.toLocaleString()}` : '-'}</td>
                       <td className="px-4 py-3 text-sm">
                        {item.variance != null ? (
                         <span className={item.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {item.variance >= 0 ? '+' : ''}₦{item.variance?.toLocaleString()}
                         </span>
                        ) : '-'}
                       </td>
                       <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                         {item.status || 'UPCOMING'}
                        </span>
                       </td>
                      </tr>
                     ))}
                   </tbody>
                  </table>
                 </div>
                )}
               </div>
              </td>
             </tr>
            )}
           </>
          ))
         )}
        </tbody>
       </table>
      </div>
       
)}
      </div>
     )}

     {/* Activities Tab */}
     {activeTab === 'activities' && (
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
       <div className="px-6 py-4 border-b border-border flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">Activity History</h2>
        <button onClick={loadActivities} className="text-sm text-emerald-600 hover:text-emerald-800 font-medium transition-colors">Refresh</button>
       </div>
       {activitiesLoading && <PulseLoader />}
       
       {!activitiesLoading && (

        <div className="overflow-x-auto">
         <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
           <tr>
            <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Date</th>
            <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Actions</th>
            <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Description</th>
            <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Source</th>
           </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
           {!activitiesLoading && activities.length === 0 ? (
            <tr>
             <td colSpan={4} className="p-8">
              <div className="flex justify-center w-full">
               <EmptyState title="No activities found for this client." />
              </div>
             </td>
            </tr>
           ) : (
            activities.map((activity: any, i: number) => {
             const dateObj = new Date(activity.timestamp || activity.createdAt || Date.now());
             const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
             const timeStr = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

             return (
              <tr key={activity.id || i} className="hover:bg-muted/30 transition-colors">
               <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground font-mono">
                <div className="font-medium text-foreground">{dateStr}</div>
                <div className="text-[11px] text-muted-foreground/70">{timeStr}</div>
               </td>
               <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground font-medium">
                <span className="font-mono text-xs bg-muted/60 dark:bg-muted/30 px-2.5 py-1 rounded-md text-foreground">
                 {activity.type || activity.action || '-'}
                </span>
               </td>
               <td className="px-4 py-4 text-sm text-foreground/90 max-w-sm">
                {activity.description || activity.message || '-'}
               </td>
               <td className="px-4 py-4 whitespace-nowrap text-sm">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                 {activity.source || activity.status || 'ONBOARDING'}
                </span>
               </td>
              </tr>
             );
            })
           )}
          </tbody>
         </table>
        </div>
       
)}
      </div>
     )}
    </>
   )}

   {/* Credit/Debit Modals */}
   {(showCreditModal || showDebitModal) && typeof document !== 'undefined' && createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
     <div className="fixed inset-0 bg-white/30 dark:bg-white/10 backdrop-blur-md" onClick={() => { setShowCreditModal(false); setShowDebitModal(false); }}></div>
     <div className="relative bg-card rounded-2xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/10">
      <div className="flex items-start justify-between mb-4">
       <h3 className="text-lg font-semibold text-foreground">{showCreditModal ? 'Credit Wallet' : 'Debit Wallet'}</h3>
       <button onClick={() => { setShowCreditModal(false); setShowDebitModal(false); }} className="text-muted-foreground/70 hover:text-muted-foreground">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
       </button>
      </div>
      <div className="space-y-4">
       <div>
        <label className="block text-sm font-medium text-foreground/90 mb-1">Amount (₦)</label>
        <input 
         value={amount} 
         onChange={(e) => setAmount(e.target.value)} 
         type="number" 
         className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400 outline-none transition-all" 
         placeholder="Enter amount..."
        />
       </div>
      </div>
      <div className="flex gap-3 mt-6 w-full">
       <button onClick={() => { setShowCreditModal(false); setShowDebitModal(false); }} className="flex-1 px-5 py-2.5 rounded-lg text-sm text-foreground/90 bg-muted/50 hover:bg-slate-200 transition-colors">Cancel</button>
       <button onClick={showCreditModal ? handleCredit : handleDebit} disabled={submitting} className={`px-5 py-2.5 rounded-lg text-sm text-white disabled:opacity-50 transition-colors flex items-center justify-center min-w-[100px] ${showCreditModal ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
        <ButtonLoader loading={submitting} loadingText="Processing...">
         Confirm
        </ButtonLoader>
       </button>
      </div>
     </div>
    </div>,
    document.body
   )}

   {/* Retry Verification Modal */}
   {showRetryModal && typeof document !== 'undefined' && createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
     <div className="fixed inset-0 bg-white/30 dark:bg-white/10 backdrop-blur-md" onClick={() => setShowRetryModal(false)}></div>
     <div className="relative bg-card rounded-2xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/10">
      <div className="flex items-start justify-between mb-4">
       <div>
        <h3 className="text-lg font-semibold text-foreground">Request Verification Retry</h3>
        <p className="text-xs text-muted-foreground mt-1">Specify reason or note for customer to re-submit verification</p>
       </div>
       <button onClick={() => setShowRetryModal(false)} className="text-muted-foreground/70 hover:text-muted-foreground">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
       </button>
      </div>
      <form onSubmit={handleRetrySubmit} className="space-y-4">
       <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Retry Reason / Note <span className="text-rose-500">*</span></label>
        <textarea 
         value={retryNote} 
         onChange={(e) => setRetryNote(e.target.value)} 
         required
         rows={3}
         className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400 outline-none transition-all resize-none bg-card text-foreground" 
         placeholder="e.g. Passport photograph was blurry. Please re-upload a clear passport photo."
        />
       </div>
       <div className="flex gap-3 mt-6 w-full">
        <button type="button" onClick={() => setShowRetryModal(false)} className="flex-1 px-5 py-2.5 rounded-lg text-sm text-foreground/90 bg-muted/50 hover:bg-slate-200 transition-colors">Cancel</button>
        <button type="submit" disabled={submitting || !retryNote.trim()} className="flex-1 px-5 py-2.5 rounded-lg text-sm text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center min-w-[160px]">
         <ButtonLoader loading={submitting} loadingText="Sending Request...">
          Send Retry Request
         </ButtonLoader>
        </button>
       </div>
      </form>
     </div>
    </div>,
    document.body
   )}
  </main>
 );
}

"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useClients } from '@/app/composables/modules/useClients';
import { useLoans } from '@/app/composables/modules/useLoans';
import { useToast } from '@/app/composables/useToast';
import { useConfirm } from '@/app/composables/useConfirm';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { createPortal } from 'react-dom';
import Link from 'next/link';

export default function ClientWalletPage() {
 const { id } = useParams();
 const clientId = typeof id === 'string' ? id : '';
 
 const { loading, error, getClientById, getClientWallet, creditClientWallet, debitClientWallet, getClientActivities } = useClients();
 const { fetchClientLoans, clientLoans, getClientLoanRepaymentPlan } = useLoans();
 const { addToast } = useToast();
 const { confirm } = useConfirm();

 const [client, setClient] = useState<any>(null);
 const [wallet, setWallet] = useState<any>(null);
 const [activities, setActivities] = useState<any[]>([]);
 const [activitiesLoading, setActivitiesLoading] = useState(false);
 const [loansLoading, setLoansLoading] = useState(false);
 const [activeTab, setActiveTab] = useState<'profile' | 'wallet' | 'loans' | 'activities'>('profile');
 
 const [showCreditModal, setShowCreditModal] = useState(false);
 const [showDebitModal, setShowDebitModal] = useState(false);
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

 const handleTabChange = (tab: 'profile' | 'wallet' | 'loans' | 'activities') => {
  setActiveTab(tab);
  if (tab === 'activities' && activities.length === 0) {
   loadActivities();
  }
  if (tab === 'loans' && clientLoans.length === 0) {
   loadClientLoans();
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

 const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
   case 'ACTIVE':
   case 'DISBURSED':
   case 'MATCHED':
    return 'bg-emerald-100 text-emerald-800';
   case 'PENDING':
   case 'UPCOMING':
    return 'bg-amber-100 text-amber-800';
   case 'OVERDUE':
   case 'NO_DEDUCTION_FOUND':
   case 'UNDER_PAID':
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
  { key: 'wallet' as const, label: 'Wallet' },
  { key: 'loans' as const, label: 'Loans' },
  { key: 'activities' as const, label: 'Activities' },
 ];

 return (
  <main className="w-full">
   <div className="flex justify-between items-center mb-3">
    <div className="flex items-center gap-4">
     <Link href="/dashboard/clients" className="text-muted-foreground hover:text-foreground transition-colors">
      &larr; Back to Clients
     </Link>
     <h1 className="text-2xl font-semibold text-foreground">Client Details</h1>
    </div>
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
        <p><span className="text-muted-foreground font-medium">Name:</span> {client.firstName} {client.lastName}</p>
        <p><span className="text-muted-foreground font-medium">Email:</span> {client.email}</p>
        <p><span className="text-muted-foreground font-medium">Phone:</span> {client.phoneNumber}</p>
        <p><span className="text-muted-foreground font-medium">Status:</span> <span className="px-2 py-1 bg-muted/50 rounded text-xs font-medium">{client.status}</span></p>
       </div>
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
       {loansLoading && <div className="p-6"><PulseLoader /></div>}
       
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
       {activitiesLoading && <div className="p-6"><PulseLoader /></div>}
       
       {!activitiesLoading && (

        <div className="overflow-x-auto">
         <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
           <tr>
            <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Date</th>
            <th className="px-4 py-4 text-right text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Actions</th>
            <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Description</th>
            <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Status</th>
           </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
 {!activitiesLoading && activities.length === 0 ? (<tr><td colSpan={4} className="p-8"><div className="flex justify-center w-full"><EmptyState title="No activities found for this client." /></div></td></tr>) : (activities.map((activity: any, i: number) => (
            <tr key={activity.id || i} className="hover:bg-muted/30 transition-colors">
             <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground font-mono">
              {new Date(activity.createdAt || activity.timestamp || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
             </td>
             <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground font-medium">{activity.action || activity.type || '-'}</td>
             <td className="px-4 py-4 text-sm text-muted-foreground max-w-xs truncate">{activity.description || activity.message || '-'}</td>
             <td className="px-4 py-4 whitespace-nowrap text-sm">
              <span className="px-2 py-1 bg-muted/50 rounded text-xs font-medium">{activity.status || '-'}</span>
             </td>
            </tr>
           )))}
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
     <div className="fixed inset-0 bg-slate-900 dark:bg-slate-800/50 backdrop-blur-sm" onClick={() => { setShowCreditModal(false); setShowDebitModal(false); }}></div>
     <div className="relative bg-card rounded-2xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
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
      <div className="flex justify-end gap-3 mt-6">
       <button onClick={() => { setShowCreditModal(false); setShowDebitModal(false); }} className="px-5 py-2.5 rounded-lg text-sm text-foreground/90 bg-muted/50 hover:bg-slate-200 transition-colors">Cancel</button>
       <button onClick={showCreditModal ? handleCredit : handleDebit} disabled={submitting} className={`px-5 py-2.5 rounded-lg text-sm text-white disabled:opacity-50 transition-colors ${showCreditModal ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
        {submitting ? 'Processing...' : 'Confirm'}
       </button>
      </div>
     </div>
    </div>,
    document.body
   )}
  </main>
 );
}

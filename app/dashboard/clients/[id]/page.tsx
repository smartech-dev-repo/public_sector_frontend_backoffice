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
import SensitiveValue from '@/app/components/ui/SensitiveValue';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { 
 Eye, 
 EyeOff, 
 Camera, 
 CheckCircle2, 
 Clock, 
 AlertCircle, 
 ShieldCheck, 
 ExternalLink, 
 Maximize2, 
 X, 
 FileText,
 BadgeCheck,
 Building2,
 Calendar,
 User,
 Phone,
 Mail,
 MapPin,
 CreditCard
} from 'lucide-react';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';

export default function ClientWalletPage() {
 const { isSuperAdmin, hasPermission } = useAdminPermissions();
 const canReview = isSuperAdmin || hasPermission('clients:review');
 const canRevokeSessions = isSuperAdmin || hasPermission('clients:sessions:revoke');
 const canReadWallet = isSuperAdmin || hasPermission('wallets:read');
 const canManageWallet = isSuperAdmin || hasPermission('wallets:manage');
 const canReadLoans = isSuperAdmin || hasPermission('client-loans:read');
 const canReadActivities = isSuperAdmin || hasPermission('audit:read') || hasPermission('clients:read');
 const canReadDocuments = isSuperAdmin || hasPermission('documents:read');

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

 // Sensitive info reveal/mask state & Lightbox preview state
 const [revealAllSensitive, setRevealAllSensitive] = useState(false);
 const [previewImage, setPreviewImage] = useState<{ url: string; title: string; subtitle?: string } | null>(null);

 const formatDate = (dateStr?: string | null, includeTime = false) => {
  if (!dateStr) return '—';
  try {
   const d = new Date(dateStr);
   if (isNaN(d.getTime())) return dateStr;
   const dateFormatted = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
   if (!includeTime) return dateFormatted;
   const timeFormatted = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
   return `${dateFormatted}, ${timeFormatted}`;
  } catch {
   return dateStr;
  }
 };

 const formatLengthOfService = (los?: any) => {
  if (!los) return '—';
  if (typeof los === 'string') return los;
  const years = los.years ?? los.year ?? 0;
  const months = los.months ?? los.month ?? 0;
  const parts: string[] = [];
  if (years) parts.push(`${years} ${years === 1 ? 'yr' : 'yrs'}`);
  if (months) parts.push(`${months} ${months === 1 ? 'mo' : 'mos'}`);
  return parts.length > 0 ? parts.join(', ') : '0 mos';
 };

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
  ...(canReadWallet ? [{ key: 'wallet' as const, label: 'Wallet' }] : []),
  ...(canReadLoans ? [{ key: 'loans' as const, label: 'Loans' }] : []),
  ...(canReadActivities ? [{ key: 'activities' as const, label: 'Activities' }] : []),
 ];

 useEffect(() => {
  if (tabs.length > 0 && !tabs.some(t => t.key === activeTab)) {
   setActiveTab(tabs[0].key);
  }
 }, [tabs, activeTab]);

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
      <button
       type="button"
       onClick={() => setRevealAllSensitive((prev) => !prev)}
       className="px-3.5 py-1.5 bg-card hover:bg-muted/60 text-foreground border border-border rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
       title={revealAllSensitive ? 'Mask all sensitive data' : 'Reveal all sensitive data'}
      >
       {revealAllSensitive ? (
        <>
         <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
         <span>Mask Sensitive</span>
        </>
       ) : (
        <>
         <Eye className="w-3.5 h-3.5 text-muted-foreground" />
         <span>Reveal Sensitive</span>
        </>
       )}
      </button>

      {client.status === 'MANUAL_REVIEW' && canReview && (
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
      {canRevokeSessions && (
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
      )}
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
          ? 'bg-card text-emerald-700 shadow-xs'
          : 'text-muted-foreground hover:text-foreground/90'
        }`}
       >
        {tab.label}
       </button>
      ))}
     </div>

     {/* Profile Tab */}
     {activeTab === 'profile' && (
      <div className="space-y-6">
       {/* Top Overview Banner */}
       <div className="bg-card p-6 rounded-2xl border border-border shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
           Customer Profile
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
           {client.onboarding?.employeeName || [client.firstName, client.lastName].filter(Boolean).join(' ') || client.name || 'Unnamed Customer'}
          </h2>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
           <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            IPPIS No: <SensitiveValue value={client.onboarding?.ippisRecord?.staffId || client.onboarding?.staffId || client.onboarding?.legacyId || client.staffId} forceRevealed={revealAllSensitive ? true : undefined} allowCopy />
           </span>
           <span className="text-muted-foreground/40">•</span>
           <span className="text-xs text-muted-foreground">
            Agency: <span className="font-semibold text-foreground">{client.onboarding?.agency || client.onboarding?.ippisRecord?.agency || '—'}</span>
           </span>
           <span className="text-muted-foreground/40">•</span>
           <span className="text-xs text-muted-foreground">
            Source: <span className="font-semibold text-foreground">{client.onboardingSource || 'SELF'}</span>
           </span>
           <span className="text-muted-foreground/40">•</span>
           <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            Client ID: <SensitiveValue value={client.id} visibleCount={8} forceRevealed={revealAllSensitive ? true : undefined} allowCopy />
           </span>
          </div>
         </div>

         <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(client.status)}`}>
           User: {client.status || 'PENDING_IPPIS'}
          </span>
          {(client.onboarding?.step || client.onboardingStep) && (
           <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            Onboarding: {client.onboarding?.step || client.onboardingStep}
           </span>
          )}
         </div>
        </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* IPPIS Civil Service & Payroll */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-xs">
         <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/60">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
           IPPIS & Civil Service Payroll
          </h3>
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">IPPIS Staff ID</span>
           <SensitiveValue 
            value={client.onboarding?.ippisRecord?.staffId || client.onboarding?.staffId || client.onboarding?.legacyId || client.staffId} 
            forceRevealed={revealAllSensitive ? true : undefined}
            allowCopy 
           />
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Government Agency</span>
           <span className="font-semibold text-foreground">{client.onboarding?.agency || client.onboarding?.ippisRecord?.agency || '—'}</span>
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Grade / Cadre</span>
           <span className="font-semibold text-foreground">{client.onboarding?.ippisRecord?.grade || '—'}</span>
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Department</span>
           <span className="font-semibold text-foreground">{client.onboarding?.ippisRecord?.department || client.onboarding?.department || '—'}</span>
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Employment Status</span>
           {(() => {
            const status = client.onboarding?.employeeStatus || client.onboarding?.ippisRecord?.employeeStatus;
            if (!status) return <span className="text-muted-foreground font-sans">—</span>;
            const isActive = String(status).toUpperCase().includes('ACTIVE');
            return (
             <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
              isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-muted/50 text-muted-foreground'
             }`}>
              {status}
             </span>
            );
           })()}
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Hire Date</span>
           <span className="font-semibold text-foreground">
            {formatDate(client.onboarding?.ippisRecord?.hireDate)}
           </span>
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Length of Service</span>
           <span className="font-semibold text-foreground">
            {formatLengthOfService(client.onboarding?.lengthOfService || onboardingStatus?.lengthOfService)}
           </span>
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Salary Bank</span>
           <span className="font-semibold text-foreground">{client.onboarding?.bankName || client.onboarding?.ippisRecord?.bankName || '—'}</span>
          </div>
          <div className="sm:col-span-2">
           <span className="text-xs text-muted-foreground block mb-0.5">Salary Account Number</span>
           <SensitiveValue 
            value={client.onboarding?.accountNumber || client.onboarding?.ippisRecord?.accountNumber} 
            forceRevealed={revealAllSensitive ? true : undefined}
            allowCopy 
           />
          </div>
         </div>
        </div>

        {/* Personal & Contact Details */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-xs">
         <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/60">
          <User className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
           Personal & Contact Details
          </h3>
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Primary Contact Phone</span>
           <SensitiveValue 
            value={client.phone || client.phoneNumber} 
            forceRevealed={revealAllSensitive ? true : undefined}
            allowCopy 
           />
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Identity Registered Phone</span>
           <SensitiveValue 
            value={client.onboarding?.identityPhoneNumber} 
            forceRevealed={revealAllSensitive ? true : undefined}
            allowCopy 
           />
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Email</span>
           <span className="font-semibold text-foreground">{client.email || '—'}</span>
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Date of Birth</span>
           <span className="font-semibold text-foreground">
            {formatDate(client.onboarding?.identityDateOfBirth)}
           </span>
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Gender</span>
           <span className="font-semibold text-foreground">{client.onboarding?.identityGender || '—'}</span>
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Marital Status</span>
           <span className="font-semibold text-foreground">{client.onboarding?.maritalStatus || '—'}</span>
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">State & LGA of Origin</span>
           <span className="font-semibold text-foreground">
            {client.onboarding?.stateOfOrigin ? `${client.onboarding.stateOfOrigin}${client.onboarding.lgaOfOrigin ? `, ${client.onboarding.lgaOfOrigin}` : ''}` : '—'}
           </span>
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">State & LGA of Residence</span>
           <span className="font-semibold text-foreground">
            {client.onboarding?.stateOfResidence ? `${client.onboarding.stateOfResidence}${client.onboarding.lgaOfResidence ? `, ${client.onboarding.lgaOfResidence}` : ''}` : '—'}
           </span>
          </div>
          <div className="sm:col-span-2">
           <span className="text-xs text-muted-foreground block mb-0.5">Residential Address & City</span>
           <span className="font-semibold text-foreground">
            {client.onboarding?.address ? `${client.onboarding.address}${client.onboarding.city ? `, ${client.onboarding.city}` : ''}${client.onboarding.stateOfResidence ? `, ${client.onboarding.stateOfResidence}` : ''}${client.onboarding.zipCode ? ` (Zip: ${client.onboarding.zipCode})` : ''}` : '—'}
           </span>
          </div>
         </div>
        </div>

        {/* Identity & KYC Checks */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-xs">
         <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/60">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
           Identity & KYC Checks
          </h3>
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">BVN (Bank Verification Number)</span>
           <SensitiveValue 
            value={client.onboarding?.bvn} 
            forceRevealed={revealAllSensitive ? true : undefined}
            allowCopy 
           />
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">NIN (National Identity Number)</span>
           <SensitiveValue 
            value={client.onboarding?.nin} 
            forceRevealed={revealAllSensitive ? true : undefined}
            allowCopy 
           />
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Identity Verification</span>
           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${client.onboarding?.identityVerified ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-800'}`}>
            {client.onboarding?.identityVerified ? 'Verified' : 'Pending'}
           </span>
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Face Match Biometrics</span>
           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${client.onboarding?.faceMatchPassed === true ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : client.onboarding?.faceMatchPassed === false ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
            {client.onboarding?.faceMatchPassed === true ? 'Passed' : client.onboarding?.faceMatchPassed === false ? 'Failed' : 'Pending'}
           </span>
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">BVN Match Score</span>
           <span className="font-semibold text-foreground">
            {client.onboarding?.faceMatchBvnScore != null ? `${Math.round(client.onboarding.faceMatchBvnScore * 100)}%` : '—'}
           </span>
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">NIN Match Score</span>
           <span className="font-semibold text-foreground">
            {client.onboarding?.faceMatchNinScore != null ? `${Math.round(client.onboarding.faceMatchNinScore * 100)}%` : '—'}
           </span>
          </div>
         </div>
        </div>

        {/* Onboarding Metadata */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-xs">
         <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/60">
          <FileText className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
           Onboarding Audit & Attribution
          </h3>
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Onboarding Channel</span>
           <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {client.onboardingSource || 'SELF'}
           </span>
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Onboarded / Created By</span>
           <div className="font-semibold text-foreground">
            {client.onboarding?.onboardedByAdmin?.fullName || client.createdByAdmin?.fullName || client.onboarding?.onboardedByAgent?.fullName || (client.onboardingSource === 'SELF' ? 'Self' : '—')}
           </div>
           {(client.onboarding?.onboardedByAdmin?.email || client.createdByAdmin?.email) && (
            <div className="text-xs text-muted-foreground mt-0.5 font-mono">
             {client.onboarding?.onboardedByAdmin?.email || client.createdByAdmin?.email}
            </div>
           )}
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Current Journey Step</span>
           <span className="font-mono text-xs font-semibold text-foreground">{client.onboarding?.step || 'IPPIS_LINKED'}</span>
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Registered At</span>
           <span className="font-semibold text-foreground">
            {formatDate(client.createdAt, true)}
           </span>
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Last Profile Update</span>
           <span className="font-semibold text-foreground">
            {formatDate(client.updatedAt || client.onboarding?.updatedAt, true)}
           </span>
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Review Note</span>
           <span className="text-foreground">{client.onboarding?.reviewNote || '—'}</span>
          </div>
         </div>
        </div>

        {/* Biometric & Identity Photos (KYC Verification) */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-xs md:col-span-2">
         <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/60 flex-wrap gap-2">
          <div className="flex items-center gap-2">
           <Camera className="w-4 h-4 text-emerald-600" />
           <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Biometric & Identity Photos (KYC Verification)
           </h3>
          </div>
          <span className="text-xs text-muted-foreground">Click any photo to zoom</span>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* BVN Photo */}
          <div className="bg-muted/20 border border-border/60 rounded-xl p-3.5 flex flex-col justify-between">
           <div>
            <div className="flex items-center justify-between mb-2.5">
             <span className="text-xs font-semibold text-foreground">BVN Photo (NIBSS)</span>
             <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              Verified
             </span>
            </div>
            {client.onboarding?.bvnSelfieUrl ? (
             <div 
              onClick={() => setPreviewImage({
               url: client.onboarding.bvnSelfieUrl,
               title: 'BVN Biometric Photo',
               subtitle: 'Verified NIBSS Identity Photo'
              })}
              className="relative group cursor-pointer aspect-square rounded-lg overflow-hidden bg-slate-900 border border-border flex items-center justify-center"
             >
              <img 
               src={client.onboarding.bvnSelfieUrl} 
               alt="BVN Selfie" 
               className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-medium">
               <Maximize2 className="w-4 h-4" />
               <span>Click to zoom</span>
              </div>
             </div>
            ) : (
             <div className="aspect-square rounded-lg border border-dashed border-border/80 flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
              <Camera className="w-8 h-8 mb-1.5 opacity-40" />
              <span className="text-xs">No BVN Photo</span>
             </div>
            )}
           </div>
           <p className="text-[11px] text-muted-foreground mt-2.5 truncate font-mono">
            {client.onboarding?.bvnSelfie || 'NIBSS Database Record'}
           </p>
          </div>

          {/* NIN Photo */}
          <div className="bg-muted/20 border border-border/60 rounded-xl p-3.5 flex flex-col justify-between">
           <div>
            <div className="flex items-center justify-between mb-2.5">
             <span className="text-xs font-semibold text-foreground">NIN Photo (NIMC)</span>
             <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              Verified
             </span>
            </div>
            {client.onboarding?.ninSelfieUrl ? (
             <div 
              onClick={() => setPreviewImage({
               url: client.onboarding.ninSelfieUrl,
               title: 'NIN Biometric Photo',
               subtitle: 'Verified NIMC Identity Record'
              })}
              className="relative group cursor-pointer aspect-square rounded-lg overflow-hidden bg-slate-900 border border-border flex items-center justify-center"
             >
              <img 
               src={client.onboarding.ninSelfieUrl} 
               alt="NIN Selfie" 
               className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-medium">
               <Maximize2 className="w-4 h-4" />
               <span>Click to zoom</span>
              </div>
             </div>
            ) : (
             <div className="aspect-square rounded-lg border border-dashed border-border/80 flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
              <Camera className="w-8 h-8 mb-1.5 opacity-40" />
              <span className="text-xs">No NIN Photo</span>
             </div>
            )}
           </div>
           <p className="text-[11px] text-muted-foreground mt-2.5 truncate font-mono">
            {client.onboarding?.ninSelfie || 'NIMC Database Record'}
           </p>
          </div>

          {/* Live Facial Capture */}
          <div className="bg-muted/20 border border-border/60 rounded-xl p-3.5 flex flex-col justify-between">
           <div>
            <div className="flex items-center justify-between mb-2.5">
             <span className="text-xs font-semibold text-foreground">Live Facial Capture</span>
             <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              client.onboarding?.liveSelfieUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
             }`}>
              {client.onboarding?.liveSelfieUrl ? 'Captured' : 'Pending Capture'}
             </span>
            </div>
            {client.onboarding?.liveSelfieUrl ? (
             <div 
              onClick={() => setPreviewImage({
               url: client.onboarding.liveSelfieUrl,
               title: 'Live Selfie Capture',
               subtitle: 'Active Liveness Verification'
              })}
              className="relative group cursor-pointer aspect-square rounded-lg overflow-hidden bg-slate-900 border border-border flex items-center justify-center"
             >
              <img 
               src={client.onboarding.liveSelfieUrl} 
               alt="Live Selfie" 
               className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-medium">
               <Maximize2 className="w-4 h-4" />
               <span>Click to zoom</span>
              </div>
             </div>
            ) : (
             <div className="aspect-square rounded-lg border border-dashed border-border/80 flex flex-col items-center justify-center text-muted-foreground p-4 text-center bg-card/50">
              <Camera className="w-8 h-8 mb-2 opacity-30 text-amber-500" />
              <span className="text-xs font-medium text-foreground/80">Pending Live Selfie</span>
              <span className="text-[10px] text-muted-foreground mt-1">Awaiting client liveness check</span>
             </div>
            )}
           </div>
           <p className="text-[11px] text-muted-foreground mt-2.5 truncate font-mono">
            {client.onboarding?.liveSelfieKey || 'Liveness check pending'}
           </p>
          </div>
         </div>
        </div>
       </div>
      </div>
     )}

     {/* Onboarding Tab */}
     {activeTab === 'onboarding' && (
      <div className="space-y-6">
       {/* Visual Journey Stepper */}
       <div className="bg-card p-6 rounded-2xl border border-border shadow-xs">
        <h2 className="text-lg font-bold text-foreground mb-1">Customer Onboarding Journey</h2>
        <p className="text-xs text-muted-foreground mb-6">Real-time verification progress across payroll, identity, and biometric checkpoints</p>

        {/* Stepper Timeline */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
         {/* Step 1: Phone */}
         <div className="p-3.5 rounded-xl border bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
           <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Step 1</span>
           <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
           <div className="text-xs font-semibold text-foreground">Phone Verified</div>
           <div className="text-[11px] text-muted-foreground mt-0.5">
            <SensitiveValue value={client.phone} forceRevealed={revealAllSensitive ? true : undefined} allowCopy />
           </div>
          </div>
         </div>

         {/* Step 2: IPPIS */}
         <div className="p-3.5 rounded-xl border bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
           <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Step 2</span>
           <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
           <div className="text-xs font-semibold text-foreground">IPPIS Linked</div>
           <div className="text-[11px] text-muted-foreground mt-0.5">
            {client.onboarding?.agency || client.onboarding?.ippisRecord?.agency || 'Civil Service'}
           </div>
          </div>
         </div>

         {/* Step 3: Identity */}
         <div className="p-3.5 rounded-xl border bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
           <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Step 3</span>
           <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
           <div className="text-xs font-semibold text-foreground">Identity Submitted</div>
           <div className="text-[11px] text-muted-foreground mt-0.5">NIN & BVN matched</div>
          </div>
         </div>

         {/* Step 4: Biometrics */}
         <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
          client.onboarding?.faceMatchPassed === true
           ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
           : client.onboarding?.faceMatchPassed === false
           ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
           : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
         }`}>
          <div className="flex items-center justify-between mb-2">
           <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 4</span>
           {client.onboarding?.faceMatchPassed === true ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
           ) : (
            <Clock className="w-4 h-4 text-amber-600" />
           )}
          </div>
          <div>
           <div className="text-xs font-semibold text-foreground">Facial Match</div>
           <div className="text-[11px] text-muted-foreground mt-0.5">
            {client.onboarding?.faceMatchPassed === true ? 'Verified' : 'Pending Capture'}
           </div>
          </div>
         </div>

         {/* Step 5: Activation */}
         <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
          client.status === 'VERIFIED'
           ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
           : 'bg-muted/30 border-border/60'
         }`}>
          <div className="flex items-center justify-between mb-2">
           <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 5</span>
           {client.status === 'VERIFIED' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
           ) : (
            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
           )}
          </div>
          <div>
           <div className="text-xs font-semibold text-foreground">Activation</div>
           <div className="text-[11px] text-muted-foreground mt-0.5">
            {client.status === 'VERIFIED' ? 'Active Client' : 'Pending IPPIS'}
           </div>
          </div>
         </div>
        </div>

        {/* Current status explanation callout */}
        <div className="mt-5 p-4 rounded-xl border border-border/60 bg-muted/20 flex items-start gap-3">
         <div className="p-2 rounded-lg bg-card border border-border shrink-0 mt-0.5">
          <Clock className="w-4 h-4 text-amber-600" />
         </div>
         <div>
          <div className="flex items-center gap-2 flex-wrap">
           <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Current Stage: {client.onboarding?.step || onboardingStatus?.step || 'IDENTITY_SUBMITTED'}
           </h4>
           <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusColor(client.status)}`}>
            {client.status || 'PENDING_IPPIS'}
           </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
           Identity and government registry records have been validated. Civil service payroll records from IPPIS are linked with active employment status ({client.onboarding?.agency || 'NPF'}).
          </p>
         </div>
        </div>
       </div>

       {/* Detailed Cards Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Civil Service Qualification & Payroll Details */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-xs">
         <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/60">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
           IPPIS Payroll Record & Service Tenure
          </h3>
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Government Agency</span>
           <span className="font-semibold text-foreground">{client.onboarding?.agency || client.onboarding?.ippisRecord?.agency || '—'}</span>
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">IPPIS Staff ID</span>
           <SensitiveValue 
            value={client.onboarding?.ippisRecord?.staffId || client.onboarding?.staffId} 
            forceRevealed={revealAllSensitive ? true : undefined}
            allowCopy 
           />
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Grade / Cadre</span>
           <span className="font-semibold text-foreground">{client.onboarding?.ippisRecord?.grade || '—'}</span>
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Employment Status</span>
           <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            {client.onboarding?.employeeStatus || client.onboarding?.ippisRecord?.employeeStatus || 'Active Employee'}
           </span>
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Hire Date</span>
           <span className="font-semibold text-foreground">
            {formatDate(client.onboarding?.ippisRecord?.hireDate)}
           </span>
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Length of Service</span>
           <span className="font-semibold text-foreground">
            {formatLengthOfService(client.onboarding?.lengthOfService || onboardingStatus?.lengthOfService)}
           </span>
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Salary Bank</span>
           <span className="font-semibold text-foreground">{client.onboarding?.bankName || client.onboarding?.ippisRecord?.bankName || '—'}</span>
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Salary Account Number</span>
           <SensitiveValue 
            value={client.onboarding?.accountNumber || client.onboarding?.ippisRecord?.accountNumber} 
            forceRevealed={revealAllSensitive ? true : undefined}
            allowCopy 
           />
          </div>
         </div>
        </div>

        {/* Identity & KYC Verification Records */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-xs">
         <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/60">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
           Identity Verification & Demographics
          </h3>
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Full Employee Name</span>
           <span className="font-semibold text-foreground">{client.onboarding?.employeeName || '—'}</span>
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Identity Phone (NIN/BVN)</span>
           <SensitiveValue 
            value={client.onboarding?.identityPhoneNumber} 
            forceRevealed={revealAllSensitive ? true : undefined}
            allowCopy 
           />
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">BVN (Bank Verification Number)</span>
           <SensitiveValue 
            value={client.onboarding?.bvn} 
            forceRevealed={revealAllSensitive ? true : undefined}
            allowCopy 
           />
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">NIN (National Identity Number)</span>
           <SensitiveValue 
            value={client.onboarding?.nin} 
            forceRevealed={revealAllSensitive ? true : undefined}
            allowCopy 
           />
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Date of Birth</span>
           <span className="font-semibold text-foreground">{formatDate(client.onboarding?.identityDateOfBirth)}</span>
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Gender & Marital Status</span>
           <span className="font-semibold text-foreground">
            {client.onboarding?.identityGender || '—'} • {client.onboarding?.maritalStatus || '—'}
           </span>
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Origin (State / LGA)</span>
           <span className="font-semibold text-foreground">
            {client.onboarding?.stateOfOrigin ? `${client.onboarding.stateOfOrigin}, ${client.onboarding.lgaOfOrigin || ''}` : '—'}
           </span>
          </div>
          <div>
           <span className="text-xs text-muted-foreground block mb-0.5">Residence (State / LGA)</span>
           <span className="font-semibold text-foreground">
            {client.onboarding?.stateOfResidence ? `${client.onboarding.stateOfResidence}, ${client.onboarding.lgaOfResidence || ''}` : '—'}
           </span>
          </div>
          <div className="sm:col-span-2">
           <span className="text-xs text-muted-foreground block mb-0.5">Residential Street Address</span>
           <span className="font-semibold text-foreground">
            {client.onboarding?.address ? `${client.onboarding.address}${client.onboarding.city ? `, ${client.onboarding.city}` : ''}` : '—'}
           </span>
          </div>
         </div>
        </div>

        {/* Biometric KYC Photos */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-xs md:col-span-2">
         <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/60 flex-wrap gap-2">
          <div className="flex items-center gap-2">
           <Camera className="w-4 h-4 text-emerald-600" />
           <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Biometric KYC Face Match Gallery
           </h3>
          </div>
          <span className="text-xs text-muted-foreground">Click any photo to preview full size</span>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* BVN Photo */}
          <div className="bg-muted/20 border border-border/60 rounded-xl p-3.5 flex flex-col justify-between">
           <div>
            <div className="flex items-center justify-between mb-2.5">
             <span className="text-xs font-semibold text-foreground">BVN Biometric (NIBSS)</span>
             <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              Verified
             </span>
            </div>
            {client.onboarding?.bvnSelfieUrl ? (
             <div 
              onClick={() => setPreviewImage({
               url: client.onboarding.bvnSelfieUrl,
               title: 'BVN Biometric Photo',
               subtitle: 'Verified NIBSS Identity Photo'
              })}
              className="relative group cursor-pointer aspect-square rounded-lg overflow-hidden bg-slate-900 border border-border flex items-center justify-center"
             >
              <img 
               src={client.onboarding.bvnSelfieUrl} 
               alt="BVN Selfie" 
               className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-medium">
               <Maximize2 className="w-4 h-4" />
               <span>Click to zoom</span>
              </div>
             </div>
            ) : (
             <div className="aspect-square rounded-lg border border-dashed border-border/80 flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
              <Camera className="w-8 h-8 mb-1.5 opacity-40" />
              <span className="text-xs">No BVN Photo</span>
             </div>
            )}
           </div>
           <p className="text-[11px] text-muted-foreground mt-2.5 truncate font-mono">
            {client.onboarding?.bvnSelfie || 'NIBSS Database Record'}
           </p>
          </div>

          {/* NIN Photo */}
          <div className="bg-muted/20 border border-border/60 rounded-xl p-3.5 flex flex-col justify-between">
           <div>
            <div className="flex items-center justify-between mb-2.5">
             <span className="text-xs font-semibold text-foreground">NIN Biometric (NIMC)</span>
             <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              Verified
             </span>
            </div>
            {client.onboarding?.ninSelfieUrl ? (
             <div 
              onClick={() => setPreviewImage({
               url: client.onboarding.ninSelfieUrl,
               title: 'NIN Biometric Photo',
               subtitle: 'Verified NIMC Identity Record'
              })}
              className="relative group cursor-pointer aspect-square rounded-lg overflow-hidden bg-slate-900 border border-border flex items-center justify-center"
             >
              <img 
               src={client.onboarding.ninSelfieUrl} 
               alt="NIN Selfie" 
               className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-medium">
               <Maximize2 className="w-4 h-4" />
               <span>Click to zoom</span>
              </div>
             </div>
            ) : (
             <div className="aspect-square rounded-lg border border-dashed border-border/80 flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
              <Camera className="w-8 h-8 mb-1.5 opacity-40" />
              <span className="text-xs">No NIN Photo</span>
             </div>
            )}
           </div>
           <p className="text-[11px] text-muted-foreground mt-2.5 truncate font-mono">
            {client.onboarding?.ninSelfie || 'NIMC Database Record'}
           </p>
          </div>

          {/* Live Selfie */}
          <div className="bg-muted/20 border border-border/60 rounded-xl p-3.5 flex flex-col justify-between">
           <div>
            <div className="flex items-center justify-between mb-2.5">
             <span className="text-xs font-semibold text-foreground">Live Facial Capture</span>
             <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              client.onboarding?.liveSelfieUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
             }`}>
              {client.onboarding?.liveSelfieUrl ? 'Captured' : 'Pending Capture'}
             </span>
            </div>
            {client.onboarding?.liveSelfieUrl ? (
             <div 
              onClick={() => setPreviewImage({
               url: client.onboarding.liveSelfieUrl,
               title: 'Live Selfie Capture',
               subtitle: 'Active Liveness Verification'
              })}
              className="relative group cursor-pointer aspect-square rounded-lg overflow-hidden bg-slate-900 border border-border flex items-center justify-center"
             >
              <img 
               src={client.onboarding.liveSelfieUrl} 
               alt="Live Selfie" 
               className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-medium">
               <Maximize2 className="w-4 h-4" />
               <span>Click to zoom</span>
              </div>
             </div>
            ) : (
             <div className="aspect-square rounded-lg border border-dashed border-border/80 flex flex-col items-center justify-center text-muted-foreground p-4 text-center bg-card/50">
              <Camera className="w-8 h-8 mb-2 opacity-30 text-amber-500" />
              <span className="text-xs font-medium text-foreground/80">Pending Live Selfie</span>
              <span className="text-[10px] text-muted-foreground mt-1">Awaiting client liveness check</span>
             </div>
            )}
           </div>
           <p className="text-[11px] text-muted-foreground mt-2.5 truncate font-mono">
            {client.onboarding?.liveSelfieKey || 'Liveness check pending'}
           </p>
          </div>
         </div>
        </div>

        {/* Uploaded Documents if any */}
        {Array.isArray(client.onboarding?.documents) && client.onboarding.documents.length > 0 && (
         <div className="bg-card p-6 rounded-2xl border border-border shadow-xs md:col-span-2">
          <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider mb-4 pb-2 border-b border-border/60">
           Uploaded Verification Documents
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
           {client.onboarding.documents.map((doc: any, idx: number) => {
            const docTitle = doc.documentType?.replace(/_/g, ' ') || 'Verification Document';
            const isPdf = typeof doc.url === 'string' && doc.url.toLowerCase().includes('.pdf');
            return (
             <div key={idx} className="p-3.5 bg-muted/20 border border-border rounded-xl text-xs flex flex-col justify-between hover:border-emerald-600/40 transition-colors">
              <div>
               <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold block text-foreground text-xs uppercase tracking-wider">{docTitle}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium">
                 {isPdf ? 'PDF' : 'IMAGE'}
                </span>
               </div>
               {doc.uploadedAt && (
                <p className="text-[10px] text-muted-foreground mb-2">
                 {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
               )}
              </div>
              {doc.url ? (
               canReadDocuments ? (
                <button
                 type="button"
                 onClick={() => setPreviewImage({
                  url: doc.url,
                  title: docTitle,
                  subtitle: `Uploaded Document • ${doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : 'Verification file'}`
                 })}
                 className="mt-2 py-1.5 px-3 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-emerald-200/60 dark:border-emerald-800/40 cursor-pointer"
                >
                 <Eye className="w-3.5 h-3.5" />
                 <span>View Document</span>
                </button>
               ) : (
                <span className="text-muted-foreground text-xs mt-2 block">Viewing restricted</span>
               )
              ) : (
               <span className="text-muted-foreground text-xs mt-2 block">Document Uploaded</span>
              )}
             </div>
            );
           })}
          </div>
         </div>
        )}
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
         {canManageWallet && (
          <div className="flex gap-3">
           <button onClick={() => setShowCreditModal(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">Credit Wallet</button>
           <button onClick={() => setShowDebitModal(true)} className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors">Debit Wallet</button>
          </div>
         )}
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

   {/* Document & Image Lightbox Modal */}
   {previewImage && typeof document !== 'undefined' && createPortal(
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6">
     <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
      onClick={() => setPreviewImage(null)} 
     />
     <div className="relative bg-card rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-border shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/40 shrink-0">
       <div className="min-w-0 pr-4">
        <h4 className="text-sm sm:text-base font-bold text-foreground truncate">{previewImage.title}</h4>
        {previewImage.subtitle && (
         <p className="text-xs text-muted-foreground truncate mt-0.5">{previewImage.subtitle}</p>
        )}
       </div>
       <div className="flex items-center gap-1.5 shrink-0">
        <a
         href={previewImage.url}
         target="_blank"
         rel="noopener noreferrer"
         className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
         title="Open file in separate tab if needed"
        >
         <ExternalLink className="w-4 h-4" />
        </a>
        <button
         onClick={() => setPreviewImage(null)}
         className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
         title="Close viewer"
        >
         <X className="w-5 h-5" />
        </button>
       </div>
      </div>

      <div className="p-4 bg-muted/20 flex-1 overflow-auto flex items-center justify-center min-h-[320px] max-h-[72vh]">
       {typeof previewImage.url === 'string' && previewImage.url.toLowerCase().includes('.pdf') ? (
        <iframe
         src={previewImage.url}
         title={previewImage.title}
         className="w-full h-[68vh] rounded-xl border border-border bg-white"
        />
       ) : (
        <img
         src={previewImage.url}
         alt={previewImage.title}
         className="max-h-[68vh] max-w-full w-auto object-contain rounded-xl shadow-md border border-border bg-slate-950/20"
        />
       )}
      </div>

      <div className="p-3.5 bg-muted/30 border-t border-border flex items-center justify-between text-xs text-muted-foreground shrink-0">
       <span className="flex items-center gap-1.5 text-[11px]">
        <span className="w-2 h-2 rounded-full bg-[#018752] inline-block"></span>
        <span>Secure In-App Document Viewer</span>
       </span>
       <button
        onClick={() => setPreviewImage(null)}
        className="px-4 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors"
       >
        Close
       </button>
      </div>
     </div>
    </div>,
    document.body
   )}
  </main>
 );
}

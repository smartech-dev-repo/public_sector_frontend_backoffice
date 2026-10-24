"use client";

import { useEffect, useState, useCallback, useMemo, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Eye, 
  X, 
  Users, 
  Banknote, 
  ExternalLink,
  ChevronDown,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Filter,
  Download,
  ArrowLeft,
  Copy,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useAgents } from '@/app/composables/modules/useAgents';
import { useLoans } from '@/app/composables/modules/useLoans';
import { useSessions } from '@/app/composables/modules/useSessions';
import { useToast } from '@/app/composables/useToast';
import { clients_api } from '@/app/api_factory/modules/clients';
import PulseLoader from '@/app/components/ui/PulseLoader';
import Pagination from '@/app/components/ui/Pagination';
import DatePicker from '@/app/components/ui/DatePicker';
import { useConfirm } from '@/app/composables/useConfirm';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';

export default function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { confirm } = useConfirm();
  const router = useRouter();
  const { id } = use(params);
  
  const { hasPermission, isSuperAdmin } = useAdminPermissions();
  const canReadAgent = isSuperAdmin || hasPermission(['agents:read', 'agents:review']);
  const canReviewAgent = isSuperAdmin || hasPermission('agents:review');
  const canManageAccess = isSuperAdmin || hasPermission('agents:onboarding-access:manage');
  const canRevokeSessions = isSuperAdmin || hasPermission('agents:sessions:revoke');
  const canReadLoans = isSuperAdmin || hasPermission('client-loans:read');
  const canReadClients = isSuperAdmin || hasPermission('clients:read');
  const canReadDocs = isSuperAdmin || hasPermission('documents:read');
  const canSendCreds = isSuperAdmin || hasPermission('agents:review');

  const { getAgentById, approveAgent, rejectAgent, resendCredentials, updateOnboardingAccess } = useAgents();
  const { revokeAgentSessions } = useSessions();
  const { clientLoans, fetchClientLoans, meta, loading: loansLoading } = useLoans();
  const { addToast } = useToast();

  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string; subtitle?: string } | null>(null);
  const [showDocsModal, setShowDocsModal] = useState(false);

  // Actions dropdown
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Copied indicator
  const [copiedId, setCopiedId] = useState(false);

  // Filters for loans table
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [filterParams, setFilterParams] = useState({ search: '', dateRange: '' });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Onboarded clients state
  const [onboardedClients, setOnboardedClients] = useState<any[]>([]);
  const [clientsMeta, setClientsMeta] = useState<any>(null);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'loans' | 'clients'>('clients');
  const [clientsPage, setClientsPage] = useState(1);
  const [clientsLimit, setClientsLimit] = useState(10);

  const resolveDocUrl = useCallback((urlOrKey?: string | null) => {
    if (!urlOrKey) return '';
    if (urlOrKey.startsWith('http://') || urlOrKey.startsWith('https://')) {
      return urlOrKey;
    }
    return urlOrKey.startsWith('/') ? urlOrKey : `/${urlOrKey}`;
  }, []);

  const agentDocuments = useMemo(() => {
    if (!application) return [];
    const docs: Array<{
      id: string;
      title: string;
      type: 'CV' | 'PASSPORT' | 'ID' | 'SUPPORTING';
      url: string;
      key?: string;
      format: string;
    }> = [];

    // 1. CV (PDF or Doc)
    const cvRaw = application.cvUrl || application.cvKey;
    if (cvRaw) {
      const url = resolveDocUrl(cvRaw);
      const isDoc = url.toLowerCase().includes('.doc');
      docs.push({
        id: 'cv',
        title: 'Curriculum Vitae (CV)',
        type: 'CV',
        url,
        key: application.cvKey,
        format: isDoc ? 'Word Document (.doc / .docx)' : 'PDF Document'
      });
    }

    // 2. Passport Photo
    const photoRaw = application.passportPhotoUrl || application.passportPhotoKey;
    if (photoRaw) {
      docs.push({
        id: 'passport',
        title: 'Passport Photograph',
        type: 'PASSPORT',
        url: resolveDocUrl(photoRaw),
        key: application.passportPhotoKey,
        format: 'Image (JPEG/PNG)'
      });
    }

    // 3. Identity Document
    const idRaw = application.identityDocumentUrl || application.identityDocumentKey || application.ninSlipUrl || application.ninSlipKey;
    if (idRaw) {
      const url = resolveDocUrl(idRaw);
      const isPdf = url.toLowerCase().includes('.pdf');
      docs.push({
        id: 'id-doc',
        title: 'National Identity / KYC Document',
        type: 'ID',
        url,
        key: application.identityDocumentKey || application.ninSlipKey,
        format: isPdf ? 'PDF Document' : 'Image (JPEG/PNG)'
      });
    }

    // 4. Supporting / Additional documents
    const supporting = application.supportingDocumentUrls || application.supportingDocumentKeys || application.documents || application.additionalDocuments || [];
    if (Array.isArray(supporting)) {
      supporting.forEach((item: any, idx: number) => {
        const itemUrl = typeof item === 'string' ? item : (item.url || item.key);
        if (itemUrl) {
          const resolved = resolveDocUrl(itemUrl);
          const isDoc = resolved.toLowerCase().includes('.doc');
          const isPdf = resolved.toLowerCase().includes('.pdf');
          docs.push({
            id: `supporting-${idx}`,
            title: item.title || item.name || `Supporting Document ${idx + 1}`,
            type: 'SUPPORTING',
            url: resolved,
            key: typeof item === 'string' ? item : item.key,
            format: isDoc ? 'Word Document' : isPdf ? 'PDF Document' : 'Document/Image'
          });
        }
      });
    }

    return docs;
  }, [application, resolveDocUrl]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setActionsOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAgentClients = useCallback(async () => {
    if (!canReadClients) return;
    setClientsLoading(true);
    try {
      const res = await clients_api.getClients({ agentId: id, page: clientsPage, limit: clientsLimit });
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setOnboardedClients(list);
      if (res.data?.meta) setClientsMeta(res.data.meta);
    } catch {
      // graceful fallback
    } finally {
      setClientsLoading(false);
    }
  }, [id, clientsPage, clientsLimit, canReadClients]);

  useEffect(() => {
    if (canReadClients) {
      fetchAgentClients();
    }
  }, [fetchAgentClients, canReadClients]);

  const fetchAgentDetails = async () => {
    if (!canReadAgent) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getAgentById(id);
      setApplication(data);
    } catch {
      addToast('Failed to load agent details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canReadAgent) {
      fetchAgentDetails();
    } else {
      setLoading(false);
    }
  }, [id, canReadAgent]);

  useEffect(() => {
    if (canReadLoans && application?.clientId) {
      const params: any = { clientId: application.clientId, page, limit };
      if (filterParams.search) params.q = filterParams.search;
      fetchClientLoans(params);
    }
  }, [fetchClientLoans, application?.clientId, page, limit, filterParams, canReadLoans]);

  useEffect(() => {
    if (!canReadLoans && canReadClients) {
      setActiveTab('clients');
    } else if (canReadLoans && !canReadClients) {
      setActiveTab('loans');
    }
  }, [canReadLoans, canReadClients]);

  const clearFilters = () => {
    setFilterParams({ search: '', dateRange: '' });
  };

  const handleCopyId = () => {
    if (!application?.id) return;
    navigator.clipboard.writeText(application.id);
    setCopiedId(true);
    addToast('Agent ID copied to clipboard', 'success');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleApprove = async () => {
    const confirmed = await confirm({ message: 'Are you sure you want to approve this agent?' });
    if (!confirmed) return;
    setSubmitting(true);
    try {
      await approveAgent(application.id);
      addToast('Agent approved successfully', 'success');
      await fetchAgentDetails();
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to approve', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    const confirmed = await confirm({ message: 'Are you sure you want to reject this agent?' });
    if (!confirmed) return;
    setSubmitting(true);
    try {
      await rejectAgent(application.id, { reason: 'Rejected by admin' });
      addToast('Application rejected successfully', 'success');
      await fetchAgentDetails();
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to reject', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendCredentials = async () => {
    const confirmed = await confirm({ message: 'Are you sure you want to resend credentials to this agent?' });
    if (!confirmed) return;
    try {
      await resendCredentials(application.id);
      addToast('Credentials resent successfully', 'success');
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to resend credentials', 'error');
    }
  };

  const handleRevokeSessions = async () => {
    const confirmed = await confirm({ message: 'Are you sure you want to revoke all active sessions for this agent?' });
    if (!confirmed) return;
    try {
      await revokeAgentSessions(application.id);
      addToast('Sessions revoked successfully', 'success');
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to revoke sessions', 'error');
    }
  };

  const handleToggleOnboarding = async () => {
    const currentStatus = application.canOnboardClients ?? true;
    const newStatus = !currentStatus;
    const confirmed = await confirm({
      title: 'Update Onboarding Access',
      message: `Are you sure you want to ${newStatus ? 'grant' : 'restrict'} client onboarding access for this agent?`,
      confirmText: newStatus ? 'Grant Access' : 'Restrict Access'
    });
    if (!confirmed) return;
    try {
      await updateOnboardingAccess(application.id, { canOnboardClients: newStatus });
      addToast(`Onboarding access ${newStatus ? 'granted' : 'restricted'} successfully`, 'success');
      await fetchAgentDetails();
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to update onboarding access', 'error');
    }
  };

  const handleExportLoans = () => {
    if (clientLoans.length === 0) {
      addToast('No loan records to export', 'error');
      return;
    }
    try {
      const headers = ['Customer Name', 'IPPIS No', 'Status', 'Loan Amount', 'Date'];
      const rows = clientLoans.map((l: any) => [
        `"${l.client?.firstName || ''} ${l.client?.lastName || ''}"`.trim(),
        `"${l.client?.ippisNumber || ''}"`,
        `"${l.status || ''}"`,
        l.amount || 0,
        `"${new Date(l.createdAt).toLocaleDateString()}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `agent_${id}_loans.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('Loans exported successfully', 'success');
    } catch {
      addToast('Failed to export loans', 'error');
    }
  };

  if (loading) {
    return <PulseLoader />;
  }

  if (!canReadAgent) {
    return (
      <div className="text-center py-16 bg-card rounded-2xl border border-border p-8 max-w-md mx-auto my-12">
        <h3 className="text-lg font-bold text-foreground mb-1">Access Restricted</h3>
        <p className="text-sm text-muted-foreground mb-4">You do not have permission to view agent details.</p>
        <Link href="/dashboard" className="text-sm font-semibold text-[#018752] hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-16 bg-card rounded-2xl border border-border p-8 max-w-md mx-auto my-12">
        <h3 className="text-lg font-bold text-foreground mb-1">Agent Not Found</h3>
        <p className="text-sm text-muted-foreground mb-4">The agent record could not be found or has been removed.</p>
        <Link href="/dashboard/agent-management" className="text-sm font-semibold text-[#018752] hover:underline">
          &larr; Back to Agent Management
        </Link>
      </div>
    );
  }

  const agentName = application.fullName || `${application.firstName || ''} ${application.lastName || ''}`.trim() || 'Agent';
  const initial = (agentName.charAt(0) || application.email?.charAt(0) || 'A').toUpperCase();
  const hasActions = canSendCreds || canManageAccess || canRevokeSessions || canReadDocs || (application.status === 'PENDING' && canReviewAgent);

  return (
    <div className="space-y-6 pb-16">
      {/* ================= TOP NAVIGATION & ACTIONS HEADER ================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/agent-management"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/60 transition-colors"
            title="Back to Agent Management"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/dashboard/agent-management" className="hover:text-foreground transition-colors">
                Agent management
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">Agent details</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mt-0.5">
              {agentName}
            </h1>
          </div>
        </div>

        {/* Actions Dropdown Button with Caret */}
        {hasActions && (
          <div className="relative self-end sm:self-auto" ref={actionsRef}>
            <button
              type="button"
              onClick={() => setActionsOpen(!actionsOpen)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#018752] hover:bg-[#017044] text-white rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer"
            >
              <span>Actions</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${actionsOpen ? 'rotate-180' : ''}`} />
            </button>

            {actionsOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-2 border-b border-border/50 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Agent Actions
                </div>

                {/* View Uploaded Documents */}
                {canReadDocs && (
                  <button
                    onClick={() => { setActionsOpen(false); setShowDocsModal(true); }}
                    className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm font-medium text-foreground hover:bg-muted flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>View Uploaded Documents</span>
                    </span>
                    {agentDocuments.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        {agentDocuments.length}
                      </span>
                    )}
                  </button>
                )}

                {/* Resend Credentials */}
                {canSendCreds && (
                  <button
                    onClick={() => { setActionsOpen(false); handleResendCredentials(); }}
                    className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm font-medium text-foreground hover:bg-muted flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Resend Credentials</span>
                  </button>
                )}

                {/* Grant / Restrict Onboarding Access */}
                {canManageAccess && (
                  <button
                    onClick={() => { setActionsOpen(false); handleToggleOnboarding(); }}
                    className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm font-medium text-foreground hover:bg-muted flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    {application.canOnboardClients === false ? (
                      <>
                        <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Grant Onboarding Access</span>
                      </>
                    ) : (
                      <>
                        <UserX className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Restrict Onboarding Access</span>
                      </>
                    )}
                  </button>
                )}

                {/* Pending Approval Actions */}
                {(application.status === 'PENDING' || application.status === 'PENDING_REVIEW' || application.status === 'SUBMITTED') && canReviewAgent && (
                  <>
                    <div className="h-px bg-border/50 my-1"></div>
                    <button
                      onClick={() => { setActionsOpen(false); handleApprove(); }}
                      disabled={submitting}
                      className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Approve Agent</span>
                    </button>
                    <button
                      onClick={() => { setActionsOpen(false); handleReject(); }}
                      disabled={submitting}
                      className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Reject Agent</span>
                    </button>
                  </>
                )}

                {/* Revoke Sessions */}
                {canRevokeSessions && (
                  <>
                    <div className="h-px bg-border/50 my-1"></div>
                    <button
                      onClick={() => { setActionsOpen(false); handleRevokeSessions(); }}
                      className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Revoke Active Sessions</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= PENDING APPROVAL ALERT BANNER ================= */}
      {(application.status === 'PENDING' || application.status === 'PENDING_REVIEW' || application.status === 'SUBMITTED') && canReviewAgent && (
        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/60 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300">Agent Awaiting Verification</h3>
              <p className="text-xs text-amber-800/80 dark:text-amber-400 mt-0.5">
                This agent application is currently pending review. Please verify the agent details and documentation before granting approval.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={handleReject}
              disabled={submitting}
              className="px-4 py-2 bg-card text-rose-600 border border-rose-200 dark:border-rose-900/50 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-xs font-semibold cursor-pointer"
            >
              Reject
            </button>
            <button
              onClick={handleApprove}
              disabled={submitting}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-xs font-semibold shadow-xs cursor-pointer"
            >
              Approve Agent
            </button>
          </div>
        </div>
      )}

      {/* ================= AGENT PROFILE CARD ================= */}
      <div className="bg-card rounded-2xl border border-border shadow-xs p-6 sm:p-7">
        {/* Profile Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#018752] to-[#015e39] text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
              {initial}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  {agentName}
                </h2>
                {/* Status Badge */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  application.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' :
                  application.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300' :
                  'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${application.status === 'APPROVED' ? 'bg-emerald-600' : application.status === 'PENDING' ? 'bg-amber-500' : 'bg-rose-600'}`}></span>
                  {application.status || 'APPROVED'}
                </span>
                {/* Onboarding Access Badge */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  application.canOnboardClients === false
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {application.canOnboardClients === false ? 'Onboarding Restricted' : 'Onboarding Authorized'}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span>Agent ID:</span>
                  <span className="font-mono font-medium text-foreground">{application.id ? `${application.id.slice(0, 12)}...` : 'N/A'}</span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                    title="Copy full ID"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </span>
                <span className="text-muted-foreground/40">•</span>
                <span>
                  Registered: <span className="font-medium text-foreground">{application.createdAt ? new Date(application.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Structured Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 text-sm">
          {/* Phone */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              Phone Number
            </span>
            <p className="font-medium text-foreground">
              {application.phone ? (
                <a href={`tel:${application.phone}`} className="hover:text-emerald-600 transition-colors">
                  {application.phone}
                </a>
              ) : 'N/A'}
            </p>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
              Email Address
            </span>
            <p className="font-medium text-foreground truncate">
              {application.email ? (
                <a href={`mailto:${application.email}`} className="hover:text-emerald-600 transition-colors truncate">
                  {application.email}
                </a>
              ) : 'N/A'}
            </p>
          </div>

          {/* Verification Document */}
          {canReadDocs && (
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                Uploaded Documents
              </span>
              <div>
                {agentDocuments.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setShowDocsModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-[#018752] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Documents ({agentDocuments.length})</span>
                  </button>
                ) : application.cvKey ? (
                  <button
                    type="button"
                    onClick={() => setPreviewDoc({
                      url: resolveDocUrl(application.cvUrl || application.cvKey),
                      title: `${agentName} - Verification Document`,
                      subtitle: `Agent ID: ${application.id}`
                    })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-[#018752] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Document</span>
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground">No documents attached</span>
                )}
              </div>
            </div>
          )}

          {/* Address */}
          <div className="space-y-1 sm:col-span-2 lg:col-span-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Residential Address
            </span>
            <p className="font-medium text-foreground leading-snug">
              {application.address || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* ================= SUMMARY STATS CARDS ================= */}
      <div className={`grid grid-cols-1 ${
        canReadLoans && canReadClients
          ? 'md:grid-cols-3'
          : canReadLoans || canReadClients
          ? 'md:grid-cols-2'
          : 'md:grid-cols-1 max-w-sm'
      } gap-5`}>
        {/* Total Loans Originated */}
        {canReadLoans && (
          <div 
            onClick={() => setActiveTab('loans')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              activeTab === 'loans' 
                ? 'bg-card border-emerald-500 shadow-sm ring-1 ring-emerald-500/20' 
                : 'bg-card border-border hover:border-emerald-500/40 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Loans Originated</span>
              <div className={`p-2 rounded-xl ${activeTab === 'loans' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-muted text-muted-foreground'}`}>
                <Banknote className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-foreground mb-1">
              {meta?.total || 0}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Originated via agent code</span>
              {activeTab === 'loans' && (
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Active View
                </span>
              )}
            </div>
          </div>
        )}

        {/* Customers Onboarded */}
        {canReadClients && (
          <div 
            onClick={() => setActiveTab('clients')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              activeTab === 'clients' 
                ? 'bg-card border-emerald-500 shadow-sm ring-1 ring-emerald-500/20' 
                : 'bg-card border-border hover:border-emerald-500/40 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customers Onboarded</span>
              <div className={`p-2 rounded-xl ${activeTab === 'clients' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-muted text-muted-foreground'}`}>
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-foreground mb-1">
              {clientsMeta?.total ?? onboardedClients.length}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Onboarded by this agent</span>
              {activeTab === 'clients' && (
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Active View
                </span>
              )}
            </div>
          </div>
        )}

        {/* Agent Account Status */}
        <div className="p-5 rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Agent Account Status</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mb-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              application.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' :
              application.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300' :
              'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${application.status === 'APPROVED' ? 'bg-emerald-600' : application.status === 'PENDING' ? 'bg-amber-500' : 'bg-rose-600'}`}></span>
              <span className="capitalize">{application.status?.toLowerCase() || 'Pending'}</span>
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {application.canOnboardClients === false ? 'Onboarding restricted' : 'Authorized for customer onboarding'}
          </span>
        </div>
      </div>

      {/* ================= DATA TABS & TABLE SECTION ================= */}
      {(canReadLoans || canReadClients) && (
        <div className="space-y-4 pt-4">
          {/* Tabs Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-3">
            <div className="flex items-center gap-2">
              {canReadLoans && (
                <button
                  type="button"
                  onClick={() => setActiveTab('loans')}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'loans'
                      ? 'bg-[#018752] text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Originated Loans</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                    activeTab === 'loans' ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {meta?.total || 0}
                  </span>
                </button>
              )}

              {canReadClients && (
                <button
                  type="button"
                  onClick={() => setActiveTab('clients')}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'clients'
                      ? 'bg-[#018752] text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Onboarded Customers</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                    activeTab === 'clients' ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {clientsMeta?.total ?? onboardedClients.length}
                  </span>
                </button>
              )}
            </div>

            {activeTab === 'clients' && canReadClients && (
              <Link
                href={`/dashboard/clients?agentId=${id}&agentName=${encodeURIComponent(agentName)}`}
                className="text-xs font-semibold text-[#018752] hover:underline flex items-center gap-1.5"
              >
                <span>Open in Customer Directory</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Table Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              {activeTab === 'loans' && canReadLoans
                ? `Showing ${clientLoans.length} of ${meta?.total || 0} originated loans`
                : activeTab === 'clients' && canReadClients
                ? `Showing ${onboardedClients.length} of ${clientsMeta?.total || onboardedClients.length} onboarded customers`
                : ''}
            </span>

            {activeTab === 'loans' && canReadLoans && (
              <div className="flex items-center gap-2.5 w-full sm:w-auto relative" ref={filterRef}>
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className={`flex items-center gap-2 px-3.5 py-2 border rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    showFilter || filterParams.search || filterParams.dateRange
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700'
                      : 'bg-card border-border text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filter</span>
                </button>

                {showFilter && (
                  <div className="absolute top-11 right-0 sm:right-auto sm:left-0 w-80 bg-card rounded-2xl border border-border p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    <h3 className="text-sm font-bold text-foreground mb-3">Filter Loans</h3>
                    <div className="space-y-3 mb-4">
                      <input 
                        value={filterParams.search}
                        onChange={(e) => setFilterParams({ ...filterParams, search: e.target.value })}
                        type="text" 
                        placeholder="Search by customer name or IPPIS..." 
                        className="w-full px-3.5 py-2 border border-border rounded-xl text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752]" 
                      />
                      <DatePicker 
                        value={filterParams.dateRange}
                        onChange={(val) => setFilterParams({ ...filterParams, dateRange: val as any })}
                        placeholder="Select date range"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={clearFilters} 
                        className="flex-1 py-2 bg-muted text-muted-foreground rounded-xl text-xs font-semibold hover:bg-muted/80 transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                      <button 
                        onClick={() => setShowFilter(false)} 
                        className="flex-1 py-2 bg-[#018752] text-white rounded-xl text-xs font-semibold hover:bg-[#017044] transition-colors cursor-pointer"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleExportLoans}
                  className="flex items-center gap-2 px-3.5 py-2 bg-card border border-border rounded-xl text-xs sm:text-sm font-medium text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Export as .xlsx</span>
                </button>
              </div>
            )}
          </div>

          {/* ================= TAB 1: ORIGINATED LOANS TABLE ================= */}
          {activeTab === 'loans' && canReadLoans && (
            <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden mt-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#E9F4EE] dark:bg-emerald-950/25 border-b border-border/70">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Customer Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">IPPIS NO.</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Loan Amt</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {loansLoading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-16 text-muted-foreground">
                          <div className="flex flex-col items-center justify-center">
                            <PulseLoader />
                            <span className="text-xs text-muted-foreground mt-2">Loading originated loans...</span>
                          </div>
                        </td>
                      </tr>
                    ) : clientLoans.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 border border-emerald-200/60 dark:border-emerald-800/60 shadow-xs">
                              <Banknote className="w-7 h-7" />
                            </div>
                            <h4 className="text-base font-bold text-foreground">No Loans Originated Yet</h4>
                            <p className="text-xs text-muted-foreground mt-1 text-center">
                              This agent has not originated any loan applications through their agent code yet.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      clientLoans.map((loan: any) => (
                        <tr key={loan.id} className="hover:bg-muted/40 transition-colors group">
                          <td className="px-6 py-4 font-semibold text-foreground">
                            {loan.client?.firstName} {loan.client?.lastName}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                            {loan.client?.ippisNumber || 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50">
                              {loan.status || 'PENDING'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-foreground">
                            ₦{Number(loan.amount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground text-xs">
                            {new Date(loan.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link 
                              href={`/dashboard/loan-requests?tab=client-loans`}
                              className="inline-flex items-center gap-1 font-medium text-xs text-emerald-700 dark:text-emerald-400 hover:underline"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Details</span>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {meta && meta.total > 0 && (
                <div className="p-4 border-t border-border/60">
                  <Pagination 
                    totalItems={meta.total} 
                    currentPage={page}
                    itemsPerPage={limit}
                    onPageChange={setPage}
                    onItemsPerPageChange={setLimit}
                  />
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: ONBOARDED CUSTOMERS TABLE ================= */}
          {activeTab === 'clients' && canReadClients && (
            <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden mt-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#E9F4EE] dark:bg-emerald-950/25 border-b border-border/70">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Customer Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">IPPIS NO.</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Agency / Sector</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Onboarded Date</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {clientsLoading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-16 text-muted-foreground">
                          <div className="flex flex-col items-center justify-center">
                            <PulseLoader />
                            <span className="text-xs text-muted-foreground mt-2">Loading onboarded customers...</span>
                          </div>
                        </td>
                      </tr>
                    ) : onboardedClients.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 border border-emerald-200/60 dark:border-emerald-800/60 shadow-xs">
                              <Users className="w-7 h-7" />
                            </div>
                            <h4 className="text-base font-bold text-foreground">No Customers Onboarded Yet</h4>
                            <p className="text-xs text-muted-foreground mt-1 text-center">
                              This agent has not onboarded any public sector civil servants yet.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      onboardedClients.map((client: any) => {
                        const name = client?.onboarding?.employeeName || client?.employeeName || [client?.firstName, client?.lastName].filter(Boolean).join(' ') || client?.phone || 'Unnamed Customer';
                        const ippis = client?.onboarding?.ippisRecord?.staffId || client?.ippisRecord?.staffId || client?.staffId || '—';
                        const sector = client?.onboarding?.agency || client?.agency || '—';
                        return (
                          <tr key={client.id} className="hover:bg-muted/40 transition-colors group">
                            <td className="px-6 py-4 font-semibold text-foreground">
                              <Link href={`/dashboard/clients/${client.id}`} className="hover:text-emerald-600 transition-colors">
                                {name}
                              </Link>
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{ippis}</td>
                            <td className="px-6 py-4 text-muted-foreground text-xs">{sector}</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50">
                                {client.status || 'VERIFIED'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground text-xs">
                              {client.createdAt ? new Date(client.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Link 
                                href={`/dashboard/clients/${client.id}`}
                                className="inline-flex items-center gap-1 font-medium text-xs text-emerald-700 dark:text-emerald-400 hover:underline"
                              >
                                <Eye className="w-4 h-4" />
                                <span>Details</span>
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {clientsMeta && clientsMeta.total > 0 && (
                <div className="p-4 border-t border-border/60">
                  <Pagination 
                    totalItems={clientsMeta.total} 
                    currentPage={clientsPage}
                    itemsPerPage={clientsLimit}
                    onPageChange={setClientsPage}
                    onItemsPerPageChange={setClientsLimit}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= AGENT UPLOADED DOCUMENTS MODAL ================= */}
      {showDocsModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[125] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowDocsModal(false)} 
          />
          <div className="relative bg-card rounded-2xl max-w-2xl w-full border border-border shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border bg-muted/40 shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#018752]" />
                  <span>Agent Uploaded Documents</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {agentName} • {agentDocuments.length} document{agentDocuments.length === 1 ? '' : 's'} available
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDocsModal(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              {agentDocuments.length === 0 ? (
                <div className="py-12 text-center max-w-sm mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">No Documents Found</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    This agent does not have any documents attached to their record.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {agentDocuments.map((doc) => {
                    return (
                      <div 
                        key={doc.id}
                        className="p-4 rounded-xl border border-border/70 bg-card hover:border-emerald-500/40 hover:shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                            doc.type === 'CV' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' :
                            doc.type === 'PASSPORT' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300' :
                            doc.type === 'ID' ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300' :
                            'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                          }`}>
                            {doc.type === 'PASSPORT' ? (
                              <ImageIcon className="w-5 h-5" />
                            ) : doc.type === 'ID' ? (
                              <ShieldCheck className="w-5 h-5" />
                            ) : (
                              <FileText className="w-5 h-5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-sm font-bold text-foreground truncate">{doc.title}</h5>
                            <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-muted-foreground">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border/50">
                                {doc.format}
                              </span>
                              {doc.key && (
                                <span className="text-[11px] font-mono truncate max-w-[200px]" title={doc.key}>
                                  {doc.key.split('/').pop()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setShowDocsModal(false);
                              setPreviewDoc({
                                url: doc.url,
                                title: `${agentName} - ${doc.title}`,
                                subtitle: doc.format
                              });
                            }}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-[#018752] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-card text-foreground border border-border rounded-lg text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>Open</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowDocsModal(false)}
                className="px-5 py-2 bg-background border border-border hover:bg-muted text-foreground rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ================= DOCUMENT LIGHTBOX MODAL ================= */}
      {previewDoc && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
            onClick={() => setPreviewDoc(null)} 
          />
          <div className="relative bg-card rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-border shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/40 shrink-0">
              <div className="min-w-0 pr-4">
                <h4 className="text-sm sm:text-base font-bold text-foreground truncate">{previewDoc.title}</h4>
                {previewDoc.subtitle && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{previewDoc.subtitle}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  title="Close viewer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 bg-muted/20 flex-1 overflow-auto flex items-center justify-center min-h-[320px] max-h-[72vh]">
              {previewDoc.url.toLowerCase().includes('.pdf') ? (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.title}
                  className="w-full h-[68vh] rounded-xl border border-border bg-white"
                />
              ) : previewDoc.url.toLowerCase().includes('.doc') ? (
                <div className="w-full h-[68vh] flex flex-col items-center justify-center bg-card rounded-xl border border-border p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="max-w-md">
                    <h4 className="text-base font-bold text-foreground">{previewDoc.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      This is a Word document (.doc / .docx). You can download it directly or view it through Google Docs.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-2 flex-wrap justify-center">
                    <a
                      href={previewDoc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#018752] hover:bg-[#017044] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Document</span>
                    </a>
                    <a
                      href={`https://docs.google.com/gview?url=${encodeURIComponent(previewDoc.url)}&embedded=true`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-xs font-semibold transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View in Google Docs</span>
                    </a>
                  </div>
                </div>
              ) : (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.title}
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
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

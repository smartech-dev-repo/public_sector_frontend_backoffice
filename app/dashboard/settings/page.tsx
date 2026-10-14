"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/composables/modules/useAuth';
import { useSessions } from '@/app/composables/modules/useSessions';
import { useLoans } from '@/app/composables/modules/useLoans';
import { useToast } from '@/app/composables/useToast';
import { useConfirm } from '@/app/composables/useConfirm';
import PulseLoader from '@/app/components/ui/PulseLoader';
import { 
  KeyRound, 
  Lock, 
  ShieldCheck, 
  ShieldAlert,
  MonitorSmartphone, 
  Sliders,
  Mail, 
  QrCode, 
  Copy, 
  Check, 
  X, 
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  Laptop,
  CheckCircle2
} from 'lucide-react';

export default function ProfileAndSecurityPage() {
  const [activeTab, setActiveTab] = useState<'security' | 'password' | 'settings' | 'sessions'>('security');
  
  const { 
    loading: authLoading, 
    profile, 
    qrCode, 
    twoFactorSetupData,
    getProfile, 
    changePassword, 
    setup2fa, 
    confirm2fa, 
    disable2fa 
  } = useAuth();

  const { 
    loading: sessionsLoading, 
    sessions, 
    fetchSessions, 
    deleteSession 
  } = useSessions();

  const {
    loanSettings,
    fetchLoanSettings,
    updateLoanSettings
  } = useLoans();

  const { addToast } = useToast();
  const { confirm } = useConfirm();

  // Admin user data with fallback to design screenshot
  const [adminName, setAdminName] = useState('Fawwaz alli-Balogun');
  const [adminEmail, setAdminEmail] = useState('allibwwaz@gmail.com');
  const [adminDept, setAdminDept] = useState('Credit and Risk department');
  const [is2faEnabled, setIs2faEnabled] = useState(true);

  // Form States - Password
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  // 2FA Setup Flow States
  const [setupMode, setSetupMode] = useState<'none' | 'TOTP' | 'EMAIL'>('none');
  const [verificationCode, setVerificationCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [setupSubmitting, setSetupSubmitting] = useState(false);

  // Loan Settings Form
  const [settingsForm, setSettingsForm] = useState({
    retirementAgeYears: 60,
    maxServiceYears: 35
  });
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
    getProfile().then(data => {
      if (data) {
        if (data.firstName || data.lastName) {
          setAdminName(`${data.firstName || ''} ${data.lastName || ''}`.trim());
        } else if (data.name) {
          setAdminName(data.name);
        }
        if (data.email) setAdminEmail(data.email);
        if (data.department) setAdminDept(data.department);
        else if (data.role?.name) setAdminDept(data.role.name);
        if (typeof data.is2faEnabled === 'boolean') {
          setIs2faEnabled(data.is2faEnabled);
        }
      }
    }).catch(() => {
      if (typeof window !== 'undefined') {
        const storedEmail = localStorage.getItem('public_sector_user_email');
        if (storedEmail) setAdminEmail(storedEmail);
      }
    });

    fetchSessions();
    fetchLoanSettings().then(res => {
      if (res) {
        setSettingsForm({
          retirementAgeYears: res.retirementAgeYears || 60,
          maxServiceYears: res.maxServiceYears || 35
        });
      }
    });
  }, [getProfile, fetchSessions, fetchLoanSettings]);

  // Handle Password Change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdForm.currentPassword) {
      return addToast('Please enter your current password', 'error');
    }
    if (pwdForm.newPassword.length < 8) {
      return addToast('New password must be at least 8 characters long', 'error');
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      return addToast('New passwords do not match', 'error');
    }

    setPwdLoading(true);
    try {
      await changePassword({ 
        currentPassword: pwdForm.currentPassword, 
        newPassword: pwdForm.newPassword 
      });
      addToast('Password updated successfully', 'success');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to update password', 'error');
    } finally {
      setPwdLoading(false);
    }
  };

  // Start 2FA Setup
  const handleInitiate2FA = async (method: 'TOTP' | 'EMAIL') => {
    setSetupSubmitting(true);
    try {
      await setup2fa({ method });
      setSetupMode(method);
      setVerificationCode('');
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to initiate 2FA setup', 'error');
    } finally {
      setSetupSubmitting(false);
    }
  };

  // Confirm 2FA Code
  const handleConfirm2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length < 6) {
      return addToast('Please enter the 6-digit verification code', 'error');
    }
    setSetupSubmitting(true);
    try {
      await confirm2fa({ code: verificationCode });
      addToast('Multi-Factor Authentication enabled successfully!', 'success');
      setIs2faEnabled(true);
      setSetupMode('none');
      setVerificationCode('');
      getProfile();
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Invalid verification code', 'error');
    } finally {
      setSetupSubmitting(false);
    }
  };

  // Disable 2FA
  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword) {
      return addToast('Please enter your current password', 'error');
    }
    setSetupSubmitting(true);
    try {
      await disable2fa({ currentPassword: disablePassword });
      addToast('Multi-Factor Authentication has been disabled', 'success');
      setIs2faEnabled(false);
      setShowDisableModal(false);
      setDisablePassword('');
      getProfile();
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Current password is incorrect', 'error');
    } finally {
      setSetupSubmitting(false);
    }
  };

  // Revoke Session
  const handleRevokeSession = async (id: string) => {
    const confirmed = await confirm({ 
      message: 'Are you sure you want to revoke this session? The device will be signed out immediately.' 
    });
    if (!confirmed) return;
    try {
      await deleteSession(id);
      addToast('Session revoked successfully', 'success');
      fetchSessions();
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to revoke session', 'error');
    }
  };

  // Save Loan Settings
  const handleSaveLoanSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    try {
      await updateLoanSettings({
        retirementAgeYears: Number(settingsForm.retirementAgeYears),
        maxServiceYears: Number(settingsForm.maxServiceYears)
      });
      addToast('Global loan settings saved successfully', 'success');
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to update loan settings', 'error');
    } finally {
      setSettingsLoading(false);
    }
  };

  const copySecret = () => {
    if (twoFactorSetupData?.secret) {
      navigator.clipboard.writeText(twoFactorSetupData.secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
      addToast('Secret copied to clipboard', 'success');
    }
  };

  return (
    <div className="w-full mx-auto space-y-8 pb-12 animate-in fade-in duration-200">
      
      {/* ======================================================== */}
      {/* 1. HERO ADMINISTRATOR PROFILE CARD (Matches Dropdown Art) */}
      {/* ======================================================== */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0c3924] via-[#018752] to-[#04331e] text-white p-6 sm:p-8 shadow-lg">
        {/* Subtle noise pattern */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-inner">
              {adminName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'FA'}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {adminName}
              </h1>
              <p className="text-sm text-white/80 font-normal">
                {adminEmail}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="px-3.5 py-1 bg-white text-[#018752] text-xs font-semibold rounded-full shadow-sm">
                  {adminDept}
                </span>
                <span className="px-3 py-1 bg-white/15 backdrop-blur-sm text-white text-xs font-medium rounded-full border border-white/20">
                  Role: Super Administrator
                </span>
              </div>
            </div>
          </div>

          {/* Quick Security Status Badge */}
          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/10 shrink-0">
            <div className={`w-3 h-3 rounded-full animate-pulse ${is2faEnabled ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <div>
              <div className="text-xs text-white/70">Account Security</div>
              <div className="text-sm font-bold text-white">
                {is2faEnabled ? 'MFA Protected' : 'MFA Recommended'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. DIRECTIVE NAVIGATION TABS                             */}
      {/* ======================================================== */}
      <div className="flex gap-2 sm:gap-3 border-b border-border pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-[#018752] text-white shadow-sm'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          Two-Factor Auth (MFA)
        </button>

        <button
          onClick={() => setActiveTab('password')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'password'
              ? 'bg-[#018752] text-white shadow-sm'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          }`}
        >
          <Lock className="w-4 h-4" />
          Password Management
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-[#018752] text-white shadow-sm'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Institutional Loan Settings
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'sessions'
              ? 'bg-[#018752] text-white shadow-sm'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          }`}
        >
          <MonitorSmartphone className="w-4 h-4" />
          Active Sessions ({sessions?.length || 1})
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: TWO-FACTOR AUTHENTICATION (MFA)                   */}
      {/* ======================================================== */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          
          {/* Status Card matching the dropdown toggle styling */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F5EE] dark:bg-emerald-950/40 text-[#018752] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Two-Factor Authentication (MFA)
                </h3>
                <p className="text-sm text-muted-foreground max-w-xl mt-1 leading-relaxed">
                  Require an additional verification code when signing into your administrative portal. 
                  Supports both TOTP Authenticator apps (Google Authenticator, Microsoft Authenticator, Authy) and direct Email OTP passcodes.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                is2faEnabled 
                  ? 'bg-[#E8F5EE] text-[#018752] border border-[#018752]/20' 
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {is2faEnabled ? 'Currently Enabled' : 'Currently Disabled'}
              </span>

              {is2faEnabled ? (
                <button
                  type="button"
                  onClick={() => setShowDisableModal(true)}
                  className="px-5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-xl border border-rose-200 transition-colors"
                >
                  Disable 2FA
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleInitiate2FA('TOTP')}
                    className="px-4 py-2 bg-[#018752] hover:bg-[#017044] text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
                  >
                    Setup Authenticator (TOTP)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInitiate2FA('EMAIL')}
                    className="px-4 py-2 border border-[#018752] text-[#018752] hover:bg-[#E8F5EE] text-xs font-semibold rounded-xl transition-all"
                  >
                    Setup Email OTP
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Setup In-Progress Wizard */}
          {setupMode !== 'none' && (
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <h4 className="text-base font-bold text-foreground">
                    {setupMode === 'TOTP' ? 'Step 1: Link Authenticator App' : 'Step 1: Verify Email OTP'}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {setupMode === 'TOTP'
                      ? 'Scan the QR code below using Google Authenticator, Authy, or 1Password.'
                      : `A 6-digit confirmation passcode was dispatched to ${adminEmail}.`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSetupMode('none')}
                  className="text-xs text-muted-foreground hover:text-foreground font-medium"
                >
                  Cancel Setup
                </button>
              </div>

              {setupMode === 'TOTP' && twoFactorSetupData?.otpauthUrl && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-border shadow-sm">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(twoFactorSetupData.otpauthUrl)}`}
                      alt="2FA QR Code" 
                      className="w-48 h-48"
                    />
                    <span className="text-xs text-slate-500 mt-3 font-medium">
                      Point camera or authenticator at QR code
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Or enter secret key manually
                      </label>
                      <div className="flex items-center gap-2 p-3 bg-muted/40 border border-border rounded-2xl">
                        <span className="font-mono font-bold text-sm text-foreground flex-1 select-all">
                          {twoFactorSetupData.secret}
                        </span>
                        <button
                          type="button"
                          onClick={copySecret}
                          className="px-3 py-1.5 bg-card border border-border rounded-lg text-xs font-semibold text-[#018752] hover:bg-muted flex items-center gap-1.5"
                        >
                          {copiedSecret ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedSecret ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleConfirm2FA} className="space-y-4 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Step 2: Enter 6-digit code generated by app
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="000000"
                          className="w-full px-4 py-3 bg-muted/30 border border-border rounded-2xl text-center font-mono tracking-widest text-xl font-bold outline-none focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={setupSubmitting || verificationCode.length < 6}
                        className="w-full py-3 bg-[#018752] hover:bg-[#017044] text-white font-semibold text-sm rounded-2xl transition-all shadow-sm disabled:opacity-50"
                      >
                        {setupSubmitting ? 'Verifying...' : 'Complete Activation'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {setupMode === 'EMAIL' && (
                <div className="max-w-md mx-auto space-y-6">
                  <div className="p-4 bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 rounded-2xl text-xs text-sky-800 dark:text-sky-300 leading-relaxed flex items-start gap-3">
                    <Mail className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Passcode Sent:</strong> Check your inbox at <strong>{adminEmail}</strong> for the one-time activation code.
                    </div>
                  </div>

                  <form onSubmit={handleConfirm2FA} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Enter 6-digit Email OTP Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="w-full px-4 py-3 bg-muted/30 border border-border rounded-2xl text-center font-mono tracking-widest text-xl font-bold outline-none focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={setupSubmitting || verificationCode.length < 6}
                      className="w-full py-3 bg-[#018752] hover:bg-[#017044] text-white font-semibold text-sm rounded-2xl transition-all shadow-sm disabled:opacity-50"
                    >
                      {setupSubmitting ? 'Verifying...' : 'Complete Activation'}
                    </button>
                  </form>
                </div>
              )}

            </div>
          )}

          {/* MFA Options Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] text-[#018752] flex items-center justify-center">
                  <QrCode className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Authenticator App (TOTP)</h4>
                  <span className="text-xs text-muted-foreground">Standard RFC 6238 time-based algorithm</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Generate instant codes directly on your mobile device even while offline. Compatible with Google Authenticator, 1Password, and Authy.
              </p>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Mail className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Email OTP Verification</h4>
                  <span className="text-xs text-muted-foreground">One-time passcodes sent via email</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Receive secure 6-digit dynamic passcodes sent directly to your institutional email address each time you authenticate.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PASSWORD MANAGEMENT                              */}
      {/* ======================================================== */}
      {activeTab === 'password' && (
        <div className="max-w-2xl bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-foreground">Change Account Password</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Choose a strong, unique password to secure your administrator access.
            </p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPwd ? 'text' : 'password'}
                  required
                  value={pwdForm.currentPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPwd ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd(!showNewPwd)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPwd ? 'text' : 'password'}
                  required
                  value={pwdForm.confirmPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-2xl border border-border text-xs text-muted-foreground space-y-1">
              <span className="font-semibold text-foreground">Password Requirements:</span>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>Minimum of 8 characters in length</li>
                <li>Should include uppercase and lowercase letters</li>
                <li>Must not match your current password</li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={pwdLoading}
                className="px-8 py-2.5 bg-[#018752] hover:bg-[#017044] text-white font-semibold text-sm rounded-xl transition-all shadow-sm disabled:opacity-50"
              >
                {pwdLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: INSTITUTIONAL LOAN SETTINGS                      */}
      {/* ======================================================== */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-foreground">Institutional Loan Settings</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Configure baseline statutory eligibility requirements applied globally across public sector loan products.
            </p>
          </div>

          <form onSubmit={handleSaveLoanSettings} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Mandatory Retirement Age (Years)
              </label>
              <input
                type="number"
                min="45"
                max="75"
                required
                value={settingsForm.retirementAgeYears}
                onChange={(e) => setSettingsForm({ ...settingsForm, retirementAgeYears: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752]"
              />
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Loans will not be approved if the repayment tenor exceeds applicant retirement age.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Maximum Service Years Allowed
              </label>
              <input
                type="number"
                min="10"
                max="45"
                required
                value={settingsForm.maxServiceYears}
                onChange={(e) => setSettingsForm({ ...settingsForm, maxServiceYears: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752]"
              />
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Maximum tenure in public service before compulsory pension transition.
              </span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={settingsLoading}
                className="px-8 py-2.5 bg-[#018752] hover:bg-[#017044] text-white font-semibold text-sm rounded-xl transition-all shadow-sm disabled:opacity-50"
              >
                {settingsLoading ? 'Saving...' : 'Save Loan Settings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: ACTIVE SESSIONS & DEVICES                        */}
      {/* ======================================================== */}
      {activeTab === 'sessions' && (
        <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-border">
            <h3 className="text-lg font-bold text-foreground">Active Administrative Sessions</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Devices currently signed into your administrative account. Revoke any unrecognized access.
            </p>
          </div>

          <div className="overflow-x-auto">
            {sessionsLoading ? (
              <div className="w-full"><PulseLoader /></div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase">
                    <th className="py-4 px-6">Device & IP</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">Last Active</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(!sessions || sessions.length === 0) ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-muted-foreground text-sm">
                        1 active session (Current device)
                      </td>
                    </tr>
                  ) : (
                    sessions.map((session: any) => (
                      <tr key={session.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#E8F5EE] text-[#018752] flex items-center justify-center shrink-0">
                              <Laptop className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">
                                {session.device || session.userAgent || 'Chrome on macOS'}
                              </div>
                              <div className="text-xs text-muted-foreground font-mono">
                                {session.ipAddress || '127.0.0.1'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-muted-foreground text-xs">
                          {session.location || 'Lagos, Nigeria'}
                        </td>
                        <td className="py-4 px-6 text-muted-foreground text-xs whitespace-nowrap">
                          {new Date(session.lastActive || session.createdAt || Date.now()).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {session.isCurrent ? (
                            <span className="px-3 py-1 bg-[#E8F5EE] text-[#018752] text-xs font-semibold rounded-full">
                              Current Session
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRevokeSession(session.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DISABLE 2FA MODAL                                        */}
      {/* ======================================================== */}
      {showDisableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDisableModal(false)}
          />
          <div className="relative bg-card rounded-3xl p-6 sm:p-8 w-full max-w-md border border-border shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Disable Two-Factor Auth</h3>
              <button 
                onClick={() => setShowDisableModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Disabling Multi-Factor Authentication lowers your account protection. Please enter your account password to confirm.
            </p>

            <form onSubmit={handleDisable2FA} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Account Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter current password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisableModal(false)}
                  className="px-4 py-2 text-sm font-medium rounded-xl border border-border hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={setupSubmitting || !disablePassword}
                  className="px-6 py-2 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
                >
                  {setupSubmitting ? 'Disabling...' : 'Confirm Disable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

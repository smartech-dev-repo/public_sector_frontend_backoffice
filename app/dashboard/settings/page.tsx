"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/composables/modules/useAuth';
import { useSessions } from '@/app/composables/modules/useSessions';
import { useLoans } from '@/app/composables/modules/useLoans';
import { useToast } from '@/app/composables/useToast';
import { useConfirm } from '@/app/composables/useConfirm';
import PulseLoader from '@/app/components/ui/PulseLoader';
import OtpInput from '@/app/components/ui/OtpInput';
import ButtonLoader from '@/app/components/ui/ButtonLoader';
import { useProfile } from '@/app/composables/modules/useProfile';
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
  CheckCircle2,
  User,
  Camera,
  Upload,
  Trash2,
  Loader2
} from 'lucide-react';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';

export default function ProfileAndSecurityPage() {
  const { hasPermission, isSuperAdmin } = useAdminPermissions();
  const canManageLoanSettings = isSuperAdmin || hasPermission('loan-settings:manage');
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'password' | 'settings' | 'sessions'>('security');
  
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
    profile: adminProfile, 
    fetchProfile, 
    updateProfile, 
    uploadProfileImage, 
    deleteProfileImage 
  } = useProfile();

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

  // Admin user data with clean defaults (no hardcoded name)
  const [adminName, setAdminName] = useState('Admin');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminDept, setAdminDept] = useState('Administrator');
  const [is2faEnabled, setIs2faEnabled] = useState(false);

  // Profile Form States
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form States - Password
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  // 2FA Setup Flow States (Modal Based)
  const [setupMode, setSetupMode] = useState<'none' | 'TOTP' | 'EMAIL'>('none');
  const [initiatingMethod, setInitiatingMethod] = useState<'TOTP' | 'EMAIL' | null>(null);
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
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('public_sector_user_email');
      if (storedEmail) setAdminEmail(storedEmail);
      const stored2fa = localStorage.getItem('admin_2fa_enabled');
      if (stored2fa !== null) setIs2faEnabled(stored2fa === 'true');
    }

    fetchProfile().then(data => {
      if (data) {
        setProfileForm({
          firstName: data.firstName || '',
          lastName: data.lastName || ''
        });
        if (data.fullName || data.firstName) {
          setAdminName(data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim());
        }
        if (data.email) setAdminEmail(data.email);
        if (data.role?.department?.name) setAdminDept(data.role.department.name);
        else if (data.role?.name) setAdminDept(data.role.name);
        if (typeof data.twoFactorEnabled === 'boolean') {
          setIs2faEnabled(data.twoFactorEnabled);
          if (typeof window !== 'undefined') {
            localStorage.setItem('admin_2fa_enabled', String(data.twoFactorEnabled));
          }
        }
      }
    }).catch(() => {
      // Graceful fallback when admin profile endpoint is unavailable
    });

    fetchSessions();
    if (canManageLoanSettings) {
      fetchLoanSettings().then(res => {
        if (res) {
          setSettingsForm({
            retirementAgeYears: res.retirementAgeYears || 60,
            maxServiceYears: res.maxServiceYears || 35
          });
        }
      });
    }
  }, [fetchProfile, fetchSessions, fetchLoanSettings, canManageLoanSettings]);

  useEffect(() => {
    if (activeTab === 'settings' && !canManageLoanSettings) {
      setActiveTab('security');
    }
  }, [activeTab, canManageLoanSettings]);

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
    setInitiatingMethod(method);
    setSetupSubmitting(true);
    try {
      await setup2fa({ method });
      setSetupMode(method);
      setVerificationCode('');
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to initiate 2FA setup', 'error');
    } finally {
      setSetupSubmitting(false);
      setInitiatingMethod(null);
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_2fa_enabled', 'true');
      }
      setSetupMode('none');
      setVerificationCode('');
      getProfile().catch(() => {});
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_2fa_enabled', 'false');
      }
      setShowDisableModal(false);
      setDisablePassword('');
      getProfile().catch(() => {});
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.firstName.trim()) {
      return addToast('First name is required', 'error');
    }
    setProfileSaving(true);
    try {
      const res = await updateProfile({
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim()
      });
      const name = res.fullName || `${res.firstName || ''} ${res.lastName || ''}`.trim();
      setAdminName(name);
      addToast('Profile updated successfully', 'success');
    } catch (err: any) {
      addToast(err?.response?.data?.message || err?.message || 'Failed to update profile', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      return addToast('Please select a valid image file (JPEG or PNG)', 'error');
    }
    setImageUploading(true);
    try {
      await uploadProfileImage(file);
      addToast('Profile photo updated successfully', 'success');
      fetchProfile();
    } catch (err: any) {
      addToast(err?.response?.data?.message || err?.message || 'Failed to upload profile photo', 'error');
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async () => {
    const confirmed = await confirm({
      message: 'Are you sure you want to remove your profile photo?'
    });
    if (!confirmed) return;
    setImageUploading(true);
    try {
      await deleteProfileImage();
      addToast('Profile photo removed successfully', 'success');
      fetchProfile();
    } catch (err: any) {
      addToast(err?.response?.data?.message || err?.message || 'Failed to remove profile photo', 'error');
    } finally {
      setImageUploading(false);
    }
  };

  const displayInitials = React.useMemo(() => {
    if (profileForm.firstName && profileForm.lastName) {
      return `${profileForm.firstName[0]}${profileForm.lastName[0]}`.toUpperCase();
    }
    if (adminName && adminName !== 'Admin') {
      const parts = adminName.trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return parts[0].slice(0, 2).toUpperCase();
    }
    return 'AD';
  }, [profileForm, adminName]);

  return (
    <div className="w-full mx-auto space-y-8 pb-12 animate-in fade-in duration-200">
      
      {/* Hidden file input for profile image upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileChange}
        accept="image/png,image/jpeg"
        className="hidden"
      />

      {/* ======================================================== */}
      {/* 1. HERO ADMINISTRATOR PROFILE CARD (Matches Dropdown Art) */}
      {/* ======================================================== */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0c3924] via-[#018752] to-[#04331e] text-white p-6 sm:p-8 shadow-lg">
        {/* Subtle noise pattern */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative group w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-inner overflow-hidden">
              {adminProfile?.profileImage ? (
                <img src={adminProfile.profileImage} alt={adminName} className="w-full h-full object-cover" />
              ) : (
                displayInitials
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={imageUploading}
                className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-semibold cursor-pointer"
                title="Change photo"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                <span>{imageUploading ? '...' : 'Change'}</span>
              </button>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {adminName || 'Admin'}
              </h1>
              <p className="text-sm text-white/80 font-normal">
                {adminEmail || 'admin@mmfb.com'}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="px-3.5 py-1 bg-white text-[#018752] text-xs font-semibold rounded-full shadow-sm">
                  {adminDept || 'Administrator'}
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
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-[#018752] text-white shadow-sm'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          }`}
        >
          <User className="w-4 h-4" />
          My Profile
        </button>

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

        {canManageLoanSettings && (
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
        )}

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
      {/* TAB 0: PROFILE MANAGEMENT                                */}
      {/* ======================================================== */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-1">Personal Information</h3>
            <p className="text-sm text-muted-foreground mb-6">Manage your administrator details and profile photo.</p>

            {/* Profile Photo Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-border mb-6">
              <div className="w-20 h-20 rounded-2xl bg-[#018752] text-white flex items-center justify-center font-bold text-2xl shadow-sm border border-emerald-600 overflow-hidden shrink-0">
                {adminProfile?.profileImage ? (
                  <img src={adminProfile.profileImage} alt={adminName} className="w-full h-full object-cover" />
                ) : (
                  displayInitials
                )}
              </div>
              <div className="space-y-2">
                <div className="text-sm font-semibold text-foreground">Profile Photo</div>
                <div className="text-xs text-muted-foreground">Supported formats: JPEG, PNG. Max size: 5MB.</div>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageUploading}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <ButtonLoader loading={imageUploading} loadingText="Uploading...">
                      <span className="flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        Upload New Photo
                      </span>
                    </ButtonLoader>
                  </button>
                  {adminProfile?.profileImage && (
                    <button
                      type="button"
                      onClick={handleDeleteImage}
                      disabled={imageUploading}
                      className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive text-xs font-semibold rounded-xl hover:bg-destructive/20 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <ButtonLoader loading={imageUploading} loadingText="Removing...">
                        <span className="flex items-center gap-1.5">
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </span>
                      </ButtonLoader>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">First Name</label>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    placeholder="First Name"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Last Name</label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    placeholder="Last Name"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email Address</label>
                <input
                  type="email"
                  value={adminEmail || 'admin@mmfb.com'}
                  disabled
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm text-muted-foreground cursor-not-allowed"
                />
                <p className="text-[11px] text-muted-foreground">Admin email address cannot be modified directly.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Assigned Role</label>
                <div className="px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm text-foreground flex items-center justify-between">
                  <span className="font-medium">{adminDept || 'Administrator'}</span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold px-2.5 py-0.5 rounded-full">Active</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-6 py-2.5 bg-[#018752] hover:bg-[#018752]/90 text-white text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-w-[140px]"
                >
                  <ButtonLoader loading={profileSaving} loadingText="Saving Changes...">
                    Save Changes
                  </ButtonLoader>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* TAB 1: TWO-FACTOR AUTHENTICATION (MFA)                   */}
      {/* ======================================================== */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          
          {/* Status Overview Card */}
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
                  Protect your institution with mobile TOTP authenticator apps or direct Email OTP passcodes.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <span className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                is2faEnabled 
                  ? 'bg-[#E8F5EE] text-[#018752] border border-[#018752]/20' 
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {is2faEnabled ? 'Currently Enabled' : 'Currently Disabled'}
              </span>

              {is2faEnabled && (
                <button
                  type="button"
                  onClick={() => setShowDisableModal(true)}
                  className="px-5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-xl border border-rose-200 transition-colors"
                >
                  Disable 2FA
                </button>
              )}
            </div>
          </div>

          {/* TWO SEPARATE CARDS: TOTP vs Email OTP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Authenticator (TOTP) */}
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs flex flex-col justify-between hover:border-[#018752]/30 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#E8F5EE] dark:bg-emerald-950/40 text-[#018752] flex items-center justify-center">
                    <QrCode className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                    is2faEnabled 
                      ? 'bg-[#E8F5EE] text-[#018752]' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {is2faEnabled ? 'Active' : 'Not Configured'}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-foreground">
                    Authenticator App (TOTP)
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">
                    Generate instant time-sensitive 6-digit codes on your smartphone using Google Authenticator, Microsoft Authenticator, Authy, or 1Password. Works even when offline.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={initiatingMethod !== null}
                  onClick={() => handleInitiate2FA('TOTP')}
                  className="w-full py-2.5 px-4 bg-[#018752] hover:bg-[#017044] text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {initiatingMethod === 'TOTP' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                      <span>{is2faEnabled ? 'Reconfiguring Authenticator...' : 'Setting up Authenticator...'}</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4" />
                      <span>{is2faEnabled ? 'Reconfigure Authenticator' : 'Setup Authenticator (TOTP)'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Card 2: Email OTP */}
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs flex flex-col justify-between hover:border-[#018752]/30 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center">
                    <Mail className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                    is2faEnabled 
                      ? 'bg-[#E8F5EE] text-[#018752]' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {is2faEnabled ? 'Active' : 'Not Configured'}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-foreground">
                    Email OTP Verification
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">
                    Receive a secure, dynamic 6-digit one-time passcode sent directly to your registered administrator email address on each sign-in attempt.
                  </p>

                  <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-sky-700 dark:text-sky-400 bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-900/40 px-3 py-1 rounded-lg">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Dispatched to: <strong>{adminEmail || 'admin@mmfb.com'}</strong></span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={initiatingMethod !== null}
                  onClick={() => handleInitiate2FA('EMAIL')}
                  className="w-full py-2.5 px-4 border border-[#018752] text-[#018752] hover:bg-[#E8F5EE] text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {initiatingMethod === 'EMAIL' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#018752] shrink-0" />
                      <span>{is2faEnabled ? 'Reconfiguring Email OTP...' : 'Setting up Email OTP...'}</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>{is2faEnabled ? 'Reconfigure Email OTP' : 'Setup Email OTP'}</span>
                    </>
                  )}
                </button>
              </div>
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
                className="px-8 py-2.5 bg-[#018752] hover:bg-[#017044] text-white font-semibold text-sm rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 min-w-[170px]"
              >
                <ButtonLoader loading={pwdLoading} loadingText="Updating Password...">
                  Update Password
                </ButtonLoader>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: INSTITUTIONAL LOAN SETTINGS                      */}
      {/* ======================================================== */}
      {activeTab === 'settings' && canManageLoanSettings && (
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
                className="px-8 py-2.5 bg-[#018752] hover:bg-[#017044] text-white font-semibold text-sm rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 min-w-[180px]"
              >
                <ButtonLoader loading={settingsLoading} loadingText="Saving Settings...">
                  Save Loan Settings
                </ButtonLoader>
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
      {/* LOADING MODAL: INITIATING 2FA (TOTP / EMAIL OTP)         */}
      {/* ======================================================== */}
      {initiatingMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-card rounded-3xl p-6 sm:p-8 w-full max-w-sm border border-border shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#E8F5EE] dark:bg-emerald-950/40 text-[#018752] flex items-center justify-center mx-auto shadow-xs">
              <Loader2 className="w-7 h-7 animate-spin stroke-[2.3]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-foreground">
                {initiatingMethod === 'EMAIL' ? 'Setting up Email OTP' : 'Setting up Authenticator'}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {initiatingMethod === 'EMAIL' 
                  ? `Sending 6-digit one-time passcode to ${adminEmail || 'your email'}...` 
                  : 'Generating secure QR code and secret key...'}
              </p>
            </div>
            <div className="pt-2 flex justify-center">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#018752] bg-[#E8F5EE] dark:bg-emerald-950/40 px-3.5 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#018752] animate-ping" />
                Connecting securely...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DISABLE 2FA MODAL                                        */}
      {/* ======================================================== */}
      {/* MODAL 1: SETUP AUTHENTICATOR APP (TOTP)                  */}
      {/* ======================================================== */}
      {setupMode === 'TOTP' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSetupMode('none')}
          />
          <div className="relative bg-card rounded-3xl p-6 sm:p-8 w-full max-w-lg border border-border shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E8F5EE] text-[#018752] flex items-center justify-center">
                  <QrCode className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Setup Authenticator App</h3>
                  <p className="text-xs text-muted-foreground">Link your TOTP authenticator app</p>
                </div>
              </div>
              <button 
                onClick={() => setSetupMode('none')}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Code section */}
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-border/80 shadow-xs">
                {twoFactorSetupData?.otpauthUrl ? (
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(twoFactorSetupData.otpauthUrl)}`}
                    alt="2FA QR Code" 
                    className="w-44 h-44"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-xs text-muted-foreground">
                    Generating QR code...
                  </div>
                )}
                <span className="text-xs text-slate-500 mt-2.5 font-medium text-center">
                  Scan with Google Authenticator, Microsoft Authenticator, or 1Password
                </span>
              </div>

              {twoFactorSetupData?.secret && (
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Or enter secret key manually
                  </label>
                  <div className="flex items-center justify-between p-2.5 bg-muted/40 border border-border rounded-xl">
                    <span className="font-mono font-bold text-xs text-foreground select-all truncate max-w-[280px]">
                      {twoFactorSetupData.secret}
                    </span>
                    <button
                      type="button"
                      onClick={copySecret}
                      className="px-2.5 py-1 bg-card border border-border rounded-lg text-xs font-semibold text-[#018752] hover:bg-muted flex items-center gap-1.5 shrink-0"
                    >
                      {copiedSecret ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedSecret ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleConfirm2FA} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 text-center">
                    Enter 6-digit verification code from app
                  </label>
                  <OtpInput
                    value={verificationCode}
                    onChange={setVerificationCode}
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSetupMode('none')}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={setupSubmitting || verificationCode.length < 6}
                    className="px-6 py-2.5 bg-[#018752] hover:bg-[#017044] text-white font-semibold text-xs rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 min-w-[150px]"
                  >
                    <ButtonLoader loading={setupSubmitting} loadingText="Verifying...">
                      Complete Activation
                    </ButtonLoader>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: SETUP EMAIL OTP VERIFICATION                    */}
      {/* ======================================================== */}
      {setupMode === 'EMAIL' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSetupMode('none')}
          />
          <div className="relative bg-card rounded-3xl p-6 sm:p-8 w-full max-w-md border border-border shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center">
                  <Mail className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Setup Email OTP</h3>
                  <p className="text-xs text-muted-foreground">Verify your administrative email</p>
                </div>
              </div>
              <button 
                onClick={() => setSetupMode('none')}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 rounded-2xl text-xs text-sky-800 dark:text-sky-300 leading-relaxed flex items-start gap-3">
              <Mail className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <strong>Passcode Sent:</strong> Check your inbox at <strong>{adminEmail || 'admin@mmfb.com'}</strong> for the one-time activation code.
              </div>
            </div>

            <form onSubmit={handleConfirm2FA} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 text-center">
                  Enter 6-digit Email OTP Code
                </label>
                <OtpInput
                  value={verificationCode}
                  onChange={setVerificationCode}
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => handleInitiate2FA('EMAIL')}
                  disabled={setupSubmitting || initiatingMethod === 'EMAIL'}
                  className="text-xs text-[#018752] hover:underline font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {initiatingMethod === 'EMAIL' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {initiatingMethod === 'EMAIL' ? 'Sending code...' : "Didn't receive code? Resend"}
                </button>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSetupMode('none')}
                  className="px-4 py-2 w-full text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={setupSubmitting || verificationCode.length < 6}
                  className="px-6 py-2.5 w-full bg-[#018752] hover:bg-[#017044] text-white font-semibold text-xs rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ButtonLoader loading={setupSubmitting} loadingText="Verifying...">
                    Complete Activation
                  </ButtonLoader>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: DISABLE 2FA CONFIRMATION                        */}
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
                  className="px-6 py-2 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 flex items-center justify-center gap-2 min-w-[140px]"
                >
                  <ButtonLoader loading={setupSubmitting} loadingText="Disabling...">
                    Confirm Disable
                  </ButtonLoader>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/composables/modules/useAuth';
import { useToast } from '@/app/composables/useToast';
import { 
  KeyRound, 
  Lock, 
  LogOut, 
  ArrowRight, 
  ShieldCheck, 
  Mail, 
  QrCode, 
  Copy, 
  Check, 
  X,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function ProfileDropdown({ isOpen, onClose, onLogout }: ProfileDropdownProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  const { 
    loading: authLoading, 
    profile, 
    getProfile, 
    changePassword, 
    setup2fa, 
    confirm2fa, 
    disable2fa 
  } = useAuth();

  // Admin user data with fallback to design screenshot
  const [adminName, setAdminName] = useState('Fawwaz alli-Balogun');
  const [adminEmail, setAdminEmail] = useState('allibwwaz@gmail.com');
  const [adminDept, setAdminDept] = useState('Credit and Risk department');
  const [is2faActive, setIs2faActive] = useState(true);

  // Modals inside dropdown
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2faModal, setShow2faModal] = useState(false);
  const [showDisable2faModal, setShowDisable2faModal] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  // 2FA Setup Form
  const [mfaMethod, setMfaMethod] = useState<'TOTP' | 'EMAIL'>('TOTP');
  const [twoFactorData, setTwoFactorData] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [mfaSubmitting, setMfaSubmitting] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [mounted, setMounted] = useState(false);

  // Fetch admin profile on mount
  useEffect(() => {
    setMounted(true);
    getProfile().then((data) => {
      if (data) {
        if (data.firstName || data.lastName) {
          setAdminName(`${data.firstName || ''} ${data.lastName || ''}`.trim());
        } else if (data.name) {
          setAdminName(data.name);
        }
        if (data.email) {
          setAdminEmail(data.email);
        }
        if (data.department) {
          setAdminDept(data.department);
        } else if (data.role?.name) {
          setAdminDept(data.role.name);
        }
        if (typeof data.is2faEnabled === 'boolean') {
          setIs2faActive(data.is2faEnabled);
        }
      }
    }).catch(() => {
      // Check localStorage email if available
      if (typeof window !== 'undefined') {
        const storedEmail = localStorage.getItem('public_sector_user_email');
        if (storedEmail) setAdminEmail(storedEmail);
      }
    });
  }, [getProfile]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  // Handle 2FA Toggle click
  const handleToggle2fa = async () => {
    if (is2faActive) {
      // Open disable modal
      setShowDisable2faModal(true);
      onClose();
    } else {
      // Start 2FA setup
      handleStart2faSetup('TOTP');
      onClose();
    }
  };

  const handleStart2faSetup = async (method: 'TOTP' | 'EMAIL') => {
    setMfaMethod(method);
    setMfaSubmitting(true);
    try {
      const res = await setup2fa({ method });
      setTwoFactorData(res);
      setShow2faModal(true);
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to initiate 2FA setup', 'error');
    } finally {
      setMfaSubmitting(false);
    }
  };

  const handleConfirm2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length < 6) {
      return addToast('Please enter a valid 6-digit code', 'error');
    }
    setMfaSubmitting(true);
    try {
      await confirm2fa({ code: verificationCode });
      addToast('Two-Factor Authentication successfully enabled!', 'success');
      setIs2faActive(true);
      setShow2faModal(false);
      setVerificationCode('');
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Invalid verification code', 'error');
    } finally {
      setMfaSubmitting(false);
    }
  };

  const handleDisable2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword) {
      return addToast('Please enter your current password', 'error');
    }
    setMfaSubmitting(true);
    try {
      await disable2fa({ currentPassword: disablePassword });
      addToast('Two-factor authentication has been disabled', 'success');
      setIs2faActive(false);
      setShowDisable2faModal(false);
      setDisablePassword('');
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Incorrect password', 'error');
    } finally {
      setMfaSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      return addToast('Please enter your current password', 'error');
    }
    if (newPassword.length < 8) {
      return addToast('New password must be at least 8 characters long', 'error');
    }
    if (newPassword !== confirmPassword) {
      return addToast('Passwords do not match', 'error');
    }
    setPwdSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });
      addToast('Password updated successfully', 'success');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setPwdSubmitting(false);
    }
  };

  const copySecret = () => {
    if (twoFactorData?.secret) {
      navigator.clipboard.writeText(twoFactorData.secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
      addToast('Secret copied to clipboard', 'success');
    }
  };

  const isAnyModalOpen = showPasswordModal || show2faModal || showDisable2faModal;
  if (!isOpen && !isAnyModalOpen) return null;

  return (
    <>
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute top-full right-0 mt-2 w-[310px] sm:w-[330px] bg-card rounded-3xl border border-border/80 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
        >
        {/* ======================================================== */}
        {/* TOP BANNER: Dark Green Texture/Gradient (Matches Screenshot) */}
        {/* ======================================================== */}
        <div className="relative p-5 text-white bg-gradient-to-br from-[#0c3924] via-[#018752] to-[#04331e] overflow-hidden">
          {/* Subtle noise texture overlay */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
          
          <div className="relative z-10 space-y-1">
            <h3 className="text-base font-bold tracking-tight text-white leading-tight">
              {adminName}
            </h3>
            <p className="text-xs text-white/80 font-normal">
              {adminEmail}
            </p>
            <div className="pt-2">
              <span className="inline-block px-3 py-1 bg-white/95 text-[#018752] text-[11px] font-semibold rounded-full shadow-sm">
                {adminDept}
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BODY ITEMS: 2FA, Change Password, Logout               */}
        {/* ======================================================== */}
        <div className="p-3 space-y-1 divide-y divide-border/50">
          
          {/* Item 1: Two factor Authentication with Toggle */}
          <div className="pt-1 pb-1">
            <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E8F5EE] dark:bg-emerald-950/40 text-[#018752] flex items-center justify-center shrink-0">
                  <KeyRound className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Two factor Authentication
                </span>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={handleToggle2fa}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  is2faActive ? 'bg-[#018752]' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                role="switch"
                aria-checked={is2faActive}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    is2faActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Item 2: Change Password */}
          <div className="pt-1 pb-1">
            <button
              type="button"
              onClick={() => { setShowPasswordModal(true); onClose(); }}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-muted/40 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E8F5EE] dark:bg-emerald-950/40 text-[#018752] flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Change password
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>

          {/* Item 3: Logout */}
          <div className="pt-1 pb-1">
            <button
              type="button"
              onClick={() => { onClose(); onLogout(); }}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-500 flex items-center justify-center shrink-0">
                  <LogOut className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-sm font-medium text-rose-500">
                  Logout
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>

          {/* Link to Full Settings Screen */}
          <div className="pt-2 pb-1 text-center">
            <Link
              href="/dashboard/settings"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#018752] hover:text-[#017044] hover:underline"
            >
              Open Full Security Dashboard
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

        </div>
      </div>
      )}

      {/* ======================================================== */}
      {/* QUICK CHANGE PASSWORD MODAL                              */}
      {/* ======================================================== */}
      {mounted && typeof document !== 'undefined' && showPasswordModal && createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPasswordModal(false)}
          />
          <div className="relative bg-card rounded-3xl p-6 sm:p-7 w-full max-w-md border border-border shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#E8F5EE] text-[#018752] flex items-center justify-center">
                  <Lock className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Change Password</h3>
              </div>
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752]"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-sm font-medium rounded-xl border border-border hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pwdSubmitting}
                  className="px-6 py-2 text-sm font-semibold rounded-xl bg-[#018752] hover:bg-[#017044] text-white disabled:opacity-50"
                >
                  {pwdSubmitting ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ======================================================== */}
      {/* 2FA SETUP MODAL (TOTP & EMAIL OTP)                       */}
      {/* ======================================================== */}
      {mounted && typeof document !== 'undefined' && show2faModal && createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShow2faModal(false)}
          />
          <div className="relative bg-card rounded-3xl p-6 sm:p-7 w-full max-w-md border border-border shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#E8F5EE] text-[#018752] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Activate Multi-Factor Auth</h3>
              </div>
              <button 
                onClick={() => setShow2faModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Method Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted/40 rounded-xl">
              <button
                type="button"
                onClick={() => handleStart2faSetup('TOTP')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  mfaMethod === 'TOTP' 
                    ? 'bg-card text-[#018752] shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                Authenticator App
              </button>
              <button
                type="button"
                onClick={() => handleStart2faSetup('EMAIL')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  mfaMethod === 'EMAIL' 
                    ? 'bg-card text-[#018752] shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                Email OTP
              </button>
            </div>

            {mfaMethod === 'TOTP' && twoFactorData?.otpauthUrl && (
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-2xl flex flex-col items-center justify-center border border-border">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(twoFactorData.otpauthUrl)}`}
                    alt="2FA QR Code" 
                    className="w-36 h-36"
                  />
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    Scan with Google Authenticator or 1Password
                  </p>
                </div>

                {twoFactorData.secret && (
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 border border-border rounded-xl text-xs">
                    <span className="font-mono font-bold text-foreground truncate max-w-[200px]">
                      {twoFactorData.secret}
                    </span>
                    <button
                      type="button"
                      onClick={copySecret}
                      className="flex items-center gap-1 text-[11px] font-semibold text-[#018752] hover:underline"
                    >
                      {copiedSecret ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedSecret ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {mfaMethod === 'EMAIL' && (
              <div className="p-4 bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 rounded-2xl text-xs text-sky-800 dark:text-sky-300 leading-relaxed flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <strong>OTP Code Sent:</strong> We sent a 6-digit verification code to <strong>{adminEmail}</strong>. Enter it below to confirm activation.
                </div>
              </div>
            )}

            <form onSubmit={handleConfirm2fa} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm font-mono tracking-widest text-center text-lg font-bold outline-none focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752]"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShow2faModal(false)}
                  className="px-4 py-2 text-sm font-medium rounded-xl border border-border hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mfaSubmitting || verificationCode.length < 6}
                  className="px-6 py-2 text-sm font-semibold rounded-xl bg-[#018752] hover:bg-[#017044] text-white disabled:opacity-50"
                >
                  {mfaSubmitting ? 'Verifying...' : 'Verify & Enable'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ======================================================== */}
      {/* DISABLE 2FA CONFIRMATION MODAL                           */}
      {/* ======================================================== */}
      {mounted && typeof document !== 'undefined' && showDisable2faModal && createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDisable2faModal(false)}
          />
          <div className="relative bg-card rounded-3xl p-6 sm:p-7 w-full max-w-md border border-border shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Disable Two-Factor Authentication</h3>
              <button 
                onClick={() => setShowDisable2faModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Disabling 2FA reduces the security of your administrative account. Please enter your account password to confirm.
            </p>

            <form onSubmit={handleDisable2fa} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Confirm Current Password
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
                  onClick={() => setShowDisable2faModal(false)}
                  className="px-4 py-2 text-sm font-medium rounded-xl border border-border hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mfaSubmitting || !disablePassword}
                  className="px-6 py-2 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
                >
                  {mfaSubmitting ? 'Disabling...' : 'Confirm Disable'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </>
  );
}

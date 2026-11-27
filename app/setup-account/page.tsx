"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/app/composables/useToast';
import { useAuth, clearAuthStorage } from '@/app/composables/core/useAuth';
import AuthInput from '@/app/components/Auth/Input';

function SetupAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const { acceptInvite, loading } = useAuth();

  const tokenParam = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [token, setToken] = useState(tokenParam);
  const [email, setEmail] = useState(emailParam);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let resolvedToken = tokenParam;
    let resolvedEmail = emailParam;

    if (!resolvedToken && typeof window !== 'undefined') {
      resolvedToken = sessionStorage.getItem('public_sector_invite_token') || '';
    }
    if (!resolvedEmail && typeof window !== 'undefined') {
      resolvedEmail = sessionStorage.getItem('public_sector_invite_email') || '';
    }

    if (resolvedToken) {
      setToken(resolvedToken);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('public_sector_invite_token', resolvedToken);
      }
    }
    if (resolvedEmail) {
      setEmail(resolvedEmail);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('public_sector_invite_email', resolvedEmail);
      }
    }
  }, [tokenParam, emailParam]);

  const hasMinLength = useMemo(() => password.length >= 8, [password]);
  const hasUpper = useMemo(() => /[A-Z]/.test(password), [password]);
  const hasLower = useMemo(() => /[a-z]/.test(password), [password]);
  const hasNumber = useMemo(() => /[0-9]/.test(password), [password]);
  const hasSymbol = useMemo(() => /[^A-Za-z0-9]/.test(password), [password]);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSymbol;

  const getPillClass = (isValid: boolean) => {
    if (isValid) {
      return 'px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[11px] font-medium rounded-full transition-colors';
    }
    return 'px-2.5 py-1 bg-muted/30 text-muted-foreground text-[11px] font-medium rounded-full transition-colors';
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      addToast('Invitation token is missing. Please click the link sent to your email.', 'error');
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      addToast('First name and last name are required.', 'error');
      return;
    }

    if (!isPasswordValid) {
      addToast('Please ensure your password meets all requirements.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await acceptInvite({
        token,
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('public_sector_invite_token');
        sessionStorage.removeItem('public_sector_invite_email');
      }

      clearAuthStorage();
      addToast('Account activated successfully! Please sign in with your credentials.', 'success');
      router.push('/login');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to complete invitation setup.';
      addToast(Array.isArray(msg) ? msg.join(', ') : msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-card p-8 rounded-2xl border border-border/50 text-center shadow-sm">
      <div className="flex justify-start items-start flex-col">
        <div className="mx-auto rounded-lg flex items-center justify-center mb-6">
          <img src="/auth-logo.png" className="h-8 w-auto" alt="Logo" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground text-left">
          Set up your account
        </h2>
        <p className="mt-2 text-sm text-muted-foreground text-left mb-6">
          {email
            ? `Finish setting up your account for ${email}`
            : 'Enter your name and create a password to finish setting up your Public Sector Admin account.'}
        </p>
      </div>

      {!token && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs text-left">
          Warning: No valid invitation token detected. If you arrived here directly, please open the link from your invitation email.
        </div>
      )}

      <form className="space-y-4 text-left" onSubmit={handleActivate}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AuthInput
            value={firstName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
            label="First name"
            type="text"
            placeholder="John"
            required
          />
          <AuthInput
            value={lastName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
            label="Last name"
            type="text"
            placeholder="Doe"
            required
          />
        </div>

        <AuthInput
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          label="Create password"
          type="password"
          placeholder="!@#$%^&*(password)"
          required
        />

        <AuthInput
          value={confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
          label="Confirm password"
          type="password"
          placeholder="!@#$%^&*(password)"
          required
        />

        <div className="flex flex-wrap gap-2 mt-4">
          <span className={getPillClass(hasMinLength)}>At least 8 characters</span>
          <span className={getPillClass(hasUpper)}>One uppercase letter</span>
          <span className={getPillClass(hasLower)}>One lowercase letter</span>
          <span className={getPillClass(hasNumber)}>One number</span>
          <span className={getPillClass(hasSymbol)}>One symbol</span>
        </div>

        <button
          type="submit"
          disabled={loading || submitting || !token}
          className="w-full mt-6 py-3 px-4 rounded-xl text-white font-medium bg-[#018752] hover:bg-[#018752]/90 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading || submitting ? 'Activating account...' : 'Activate account'}
        </button>
      </form>
    </div>
  );
}

export default function SetupAccountPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-[420px] w-full">
        <Suspense fallback={<div className="text-center p-8 text-sm text-muted-foreground">Loading account setup...</div>}>
          <SetupAccountContent />
        </Suspense>
      </div>
    </div>
  );
}

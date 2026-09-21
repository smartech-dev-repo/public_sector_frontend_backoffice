"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/composables/core/useAuth';

import { Suspense } from 'react';

function InviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { acceptInvite, loading } = useAuth();

  const tokenParam = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || 'name@moneyfieldmfb.com';

  const [token] = useState(tokenParam);
  const [email] = useState(emailParam);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await acceptInvite({ token, email });
      router.push('/setup-account');
    } catch (e) {
      // Error handled in composable
    }
  };

  const handleDecline = () => {
    // Simple action for now
    router.push('/login');
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
      {/* Logo placeholder */}
      <div className="mx-auto rounded-lg flex items-center justify-center mb-6">
        <span className="font-bold text-lg text-emerald-600 tracking-tight">MAKERCHECKER</span>
      </div>
      
      <h2 className="text-xl text-center font-semibold text-slate-900 text-left">You&apos;ve been invited.</h2>
      <p className="mt-2 text-center text-sm text-slate-500 text-left mb-6">John has invited you to join Moneyfield Public Sector Admin Portal.</p>

      <form className="space-y-4 text-left" onSubmit={handleAccept}>
        {/* Readonly email input using standard input style to match screenshot */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] font-medium text-slate-700">
          {email}
        </div>
        
        <button disabled={loading} type="submit" className="w-full mt-2 py-3 px-4 rounded-xl text-white font-medium bg-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-50">
          {loading ? 'Accepting...' : 'Accept Invitation'}
        </button>
      </form>

      <div className="mt-6 text-sm text-slate-600">
        Not interested in joining? <button onClick={handleDecline} className="text-red-500 hover:underline font-medium">Decline invitation</button>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-[400px] w-full">
        <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
          <InviteForm />
        </Suspense>
      </div>
    </div>
  );
}

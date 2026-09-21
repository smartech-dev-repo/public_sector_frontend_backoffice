"use client";

import Link from 'next/link';

export default function PasswordResetSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-[400px] w-full">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
          {/* Success Icon with pseudo confetti */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-emerald-500 rounded-full flex items-center justify-center z-10">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            {/* Confetti particles (CSS approximations) */}
            <div className="absolute w-2 h-2 bg-blue-400 rounded-full top-0 -left-2"></div>
            <div className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-sm top-4 -right-4 rotate-12"></div>
            <div className="absolute w-2 h-2 bg-red-400 rounded-full bottom-2 -left-4"></div>
            <div className="absolute w-2 h-2 bg-emerald-400 rounded-sm bottom-0 -right-2 rotate-45"></div>
          </div>
          
          <h2 className="text-xl font-semibold text-slate-900">Password reset successfully</h2>
          <p className="mt-2 text-[13.5px] text-slate-500 mb-8">
            Your password has been updated. You can now sign in with your new password.
          </p>

          <Link href="/login" className="w-full py-3 px-4 rounded-xl text-white font-medium bg-emerald-500 hover:bg-emerald-600 transition-colors block text-center">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

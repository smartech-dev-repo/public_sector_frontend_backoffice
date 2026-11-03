"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PulseLoader from '@/app/components/ui/PulseLoader';
import ClientLoansTab from '../loan-requests/components/ClientLoansTab';

function ClientLoansRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', 'client-loans');
    router.replace(`/dashboard/loan-requests?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="space-y-4">
      <Suspense fallback={<PulseLoader />}>
        <ClientLoansTab />
      </Suspense>
    </div>
  );
}

export default function ClientLoansPage() {
  return (
    <Suspense fallback={<PulseLoader />}>
      <ClientLoansRedirect />
    </Suspense>
  );
}

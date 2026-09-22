"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useClients } from '@/app/composables/modules/useClients';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import { createPortal } from 'react-dom';
import Link from 'next/link';

export default function ClientWalletPage() {
  const { id } = useParams();
  const clientId = typeof id === 'string' ? id : '';
  
  const { loading, error, getClientById, getClientWallet, creditClientWallet, debitClientWallet } = useClients();
  const { addToast } = useToast();

  const [client, setClient] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showDebitModal, setShowDebitModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleCredit = async () => {
    if (!amount || isNaN(Number(amount))) {
      addToast('Please enter a valid amount', 'error');
      return;
    }
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

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/clients" className="text-slate-500 hover:text-slate-800 transition-colors">
            &larr; Back to Clients
          </Link>
          <h1 className="text-2xl font-semibold text-slate-800">Client Details</h1>
        </div>
      </div>

      {loading && !client && <PulseLoader />}
      {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}

      {!loading && client && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Profile</h2>
            <div className="space-y-3">
              <p><span className="text-slate-500 font-medium">Name:</span> {client.firstName} {client.lastName}</p>
              <p><span className="text-slate-500 font-medium">Email:</span> {client.email}</p>
              <p><span className="text-slate-500 font-medium">Phone:</span> {client.phoneNumber}</p>
              <p><span className="text-slate-500 font-medium">Status:</span> <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">{client.status}</span></p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Wallet</h2>
            {wallet ? (
              <div className="space-y-6">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Available Balance</p>
                  <p className="text-3xl font-bold text-slate-800">₦{wallet.balance?.toLocaleString() || 0}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowCreditModal(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">Credit Wallet</button>
                  <button onClick={() => setShowDebitModal(true)} className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors">Debit Wallet</button>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No wallet information available.</p>
            )}
          </div>
        </div>
      )}

      {/* Credit/Debit Modals */}
      {(showCreditModal || showDebitModal) && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => { setShowCreditModal(false); setShowDebitModal(false); }}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{showCreditModal ? 'Credit Wallet' : 'Debit Wallet'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₦)</label>
                <input 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  type="number" 
                  className="w-full px-4 py-2 border rounded-lg" 
                  placeholder="Enter amount..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowCreditModal(false); setShowDebitModal(false); }} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg">Cancel</button>
              <button onClick={showCreditModal ? handleCredit : handleDebit} disabled={submitting} className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 ${showCreditModal ? 'bg-emerald-600' : 'bg-rose-600'}`}>
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

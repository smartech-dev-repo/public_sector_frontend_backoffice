const fs = require('fs');

const path = '/Users/marquis/public-sector/admin/app/dashboard/clients/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Imports
content = content.replace(
  "import { useEffect } from 'react';",
  "import { useEffect, useState } from 'react';\nimport { createPortal } from 'react-dom';"
);

// 2. Hooks and state
content = content.replace(
  "const { loading, error, clients, fetchClients, retryClient, approveClient } = useClients();",
  "const { loading, error, clients, fetchClients, retryClient, approveClient, getClientWallet, creditClientWallet, debitClientWallet } = useClients();\n  const [showWalletModal, setShowWalletModal] = useState(false);\n  const [selectedClient, setSelectedClient] = useState<any>(null);\n  const [wallet, setWallet] = useState<any>(null);\n  const [amount, setAmount] = useState<number | ''>('');\n  const [walletLoading, setWalletLoading] = useState(false);\n  const [note, setNote] = useState('');"
);

// 3. openWalletModal handler
const handlers = `  const openWalletModal = async (client: any) => {
    setSelectedClient(client);
    setWallet(null);
    setAmount('');
    setNote('');
    setShowWalletModal(true);
    setWalletLoading(true);
    try {
      const data = await getClientWallet(client.id);
      setWallet(data);
    } catch (e: any) {
      addToast('Failed to load wallet', 'error');
    } finally {
      setWalletLoading(false);
    }
  };

  const handleCredit = async () => {
    if (!amount || amount <= 0) return addToast('Enter a valid amount', 'error');
    setWalletLoading(true);
    try {
      await creditClientWallet(selectedClient.id, { amount: Number(amount), reference: 'REF-' + Date.now(), description: note || 'Credit' });
      addToast('Wallet credited successfully', 'success');
      setAmount('');
      setNote('');
      const data = await getClientWallet(selectedClient.id);
      setWallet(data);
    } catch (e: any) {
      addToast(e?.response?.data?.message || 'Failed to credit wallet', 'error');
    } finally {
      setWalletLoading(false);
    }
  };

  const handleDebit = async () => {
    if (!amount || amount <= 0) return addToast('Enter a valid amount', 'error');
    setWalletLoading(true);
    try {
      await debitClientWallet(selectedClient.id, { amount: Number(amount), reference: 'REF-' + Date.now(), description: note || 'Debit' });
      addToast('Wallet debited successfully', 'success');
      setAmount('');
      setNote('');
      const data = await getClientWallet(selectedClient.id);
      setWallet(data);
    } catch (e: any) {
      addToast(e?.response?.data?.message || 'Failed to debit wallet', 'error');
    } finally {
      setWalletLoading(false);
    }
  };
`;

content = content.replace(
  "const handleApprove =",
  handlers + "\n  const handleApprove ="
);

// 4. Update Actions td to include Wallet button
content = content.replace(
  /<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">\s*\{client\.status === 'MANUAL_REVIEW' && \(\s*<button onClick=\{\(\) => handleApprove\(client\.id\)\} className="text-emerald-600 hover:text-emerald-800 transition-colors">Approve<\/button>\s*\)\}\s*<button onClick=\{\(\) => handleRetry\(client\.id\)\} className="text-amber-600 hover:text-amber-800 transition-colors">Retry<\/button>\s*<button onClick=\{\(\) => handleRevoke\(client\.id\)\} className="text-rose-600 hover:text-rose-800 transition-colors">Revoke Sessions<\/button>\s*<\/td>/g,
  `<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button onClick={() => openWalletModal(client)} className="text-blue-600 hover:text-blue-800 transition-colors">Wallet</button>
                    {client.status === 'MANUAL_REVIEW' && (
                      <button onClick={() => handleApprove(client.id)} className="text-emerald-600 hover:text-emerald-800 transition-colors">Approve</button>
                    )}
                    <button onClick={() => handleRetry(client.id)} className="text-amber-600 hover:text-amber-800 transition-colors">Retry</button>
                    <button onClick={() => handleRevoke(client.id)} className="text-rose-600 hover:text-rose-800 transition-colors">Revoke</button>
                  </td>`
);

// 5. Inject Wallet Modal
const walletModal = `      {showWalletModal && selectedClient && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowWalletModal(false)}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Client Wallet</h3>
                <p className="text-sm text-slate-500 mt-1">{selectedClient.firstName} {selectedClient.lastName}</p>
              </div>
              <button onClick={() => setShowWalletModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 text-center">
              <p className="text-sm text-slate-500 mb-1">Available Balance</p>
              {walletLoading && !wallet ? (
                <div className="animate-pulse h-8 w-32 bg-slate-200 rounded mx-auto"></div>
              ) : (
                <h4 className="text-3xl font-bold text-slate-800">₦{wallet?.balance?.toLocaleString() || '0.00'}</h4>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₦)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="Enter amount" 
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Note / Description</label>
                <input 
                  type="text" 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Refund or Adjustment" 
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button onClick={handleDebit} disabled={walletLoading || !amount} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors disabled:opacity-50">
                  Debit Wallet
                </button>
                <button onClick={handleCredit} disabled={walletLoading || !amount} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-50">
                  Credit Wallet
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
`;

content = content.replace(
  "</main>",
  walletModal + "\n    </main>"
);

fs.writeFileSync(path, content);
console.log('Done modifying clients/page.tsx');

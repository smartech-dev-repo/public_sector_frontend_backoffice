"use client";

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Paperclip, X } from 'lucide-react';

interface Props {
 title: string;
 /** What happens when they confirm, in a sentence. */
 description: React.ReactNode;
 confirmText: string;
 tone?: 'danger' | 'primary';
 /** Shows the optional proof file field. */
 allowProof?: boolean;
 onCancel: () => void;
 /** Resolve true to close the dialog; false keeps it open (e.g. the server refused). */
 onConfirm: (reason: string, proof: File | null) => Promise<boolean>;
}

const PROOF_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_PROOF = 5 * 1024 * 1024;

/** A required reason, and optionally a proof file, before a device is released or a request decided. */
export default function ReasonDialog({ title, description, confirmText, tone = 'primary', allowProof, onCancel, onConfirm }: Props) {
 const [reason, setReason] = useState('');
 const [proof, setProof] = useState<File | null>(null);
 const [error, setError] = useState('');
 const [busy, setBusy] = useState(false);
 const tooShort = reason.trim().length < 5;

 const pick = (file: File | null) => {
  setError('');
  if (file && !PROOF_TYPES.includes(file.type)) return setError('Proof must be a JPEG, PNG or PDF file.');
  if (file && file.size > MAX_PROOF) return setError('Proof must be 5 MB or smaller.');
  setProof(file);
 };

 const submit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (tooShort) return setError('Give a reason of at least 5 characters.');
  setBusy(true);
  const close = await onConfirm(reason.trim(), proof);
  setBusy(false);
  if (close) onCancel();
 };

 return createPortal(
  <div className="fixed inset-0 z-modal flex items-center justify-center">
   <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm" onClick={busy ? undefined : onCancel} />
   <form onSubmit={submit} role="dialog" aria-modal="true" aria-label={title} className="relative bg-card rounded-2xl p-6 w-full max-w-md mx-4 border border-border shadow-2xl space-y-4">
    <div className="flex items-start justify-between gap-3">
     <h3 className="text-lg font-semibold text-foreground">{title}</h3>
     <button type="button" onClick={onCancel} aria-label="Close" className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
    </div>
    <div className="text-sm text-muted-foreground">{description}</div>
    <label className="block text-sm font-medium text-foreground">
     Reason <span className="text-rose-600">*</span>
     <textarea
      autoFocus
      required
      rows={3}
      maxLength={1000}
      value={reason}
      onChange={(e) => { setReason(e.target.value); setError(''); }}
      placeholder="e.g. Agent called from their registered number; old phone stolen"
      className="mt-1 w-full px-3 py-2.5 bg-card border border-border rounded-lg text-sm font-normal outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400"
     />
     <span className="block mt-1 text-xs font-normal text-muted-foreground">Kept in the audit trail and shown to the account owner.</span>
    </label>
    {allowProof && (
     <div>
      <span className="block text-sm font-medium text-foreground mb-1">Proof (optional)</span>
      {proof ? (
       <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border bg-muted/30 text-sm">
        <span className="flex items-center gap-2 min-w-0"><Paperclip className="w-4 h-4 shrink-0 text-muted-foreground" /><span className="truncate">{proof.name}</span></span>
        <button type="button" onClick={() => setProof(null)} className="text-xs font-semibold text-rose-700 dark:text-rose-400">Remove</button>
       </div>
      ) : (
       <label className="flex items-center justify-center gap-2 h-11 rounded-lg border border-dashed border-border text-sm text-muted-foreground cursor-pointer hover:bg-muted/40">
        <Paperclip className="w-4 h-4" /> Attach a letter, report or screenshot
        <input type="file" accept="image/jpeg,image/png,application/pdf" className="sr-only" onChange={(e) => pick(e.target.files?.[0] ?? null)} />
       </label>
      )}
      <span className="block mt-1 text-xs text-muted-foreground">JPEG, PNG or PDF, up to 5 MB.</span>
     </div>
    )}
    {error && <p role="alert" className="text-sm text-rose-700 dark:text-rose-400">{error}</p>}
    <div className="flex gap-3 pt-1">
     <button type="button" onClick={onCancel} disabled={busy} className="flex-1 h-11 rounded-lg text-sm text-foreground bg-muted/50 hover:bg-muted disabled:opacity-50">Cancel</button>
     <button
      type="submit"
      disabled={busy || tooShort}
      className={`flex-1 h-11 rounded-lg text-sm font-semibold text-white disabled:opacity-50 ${tone === 'danger' ? 'bg-rose-700 hover:bg-rose-800' : 'bg-emerald-700 hover:bg-emerald-800'}`}
     >
      {busy ? 'Saving...' : confirmText}
     </button>
    </div>
   </form>
  </div>,
  document.body,
 );
}

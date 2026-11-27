"use client";

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { ExternalLink, X } from 'lucide-react';
import ClientWalletPanel from './ClientWalletPanel';

interface Props {
  clientId: string;
  clientName?: string | null;
  canManage: boolean;
  /** Whether this admin can open the client's profile (clients:review). */
  canOpenClient: boolean;
  onClose: () => void;
}

/** A client's wallet beside the list, for admins who see wallets but may not open client profiles. */
export default function WalletStatementDrawer({ clientId, clientName, canManage, canOpenClient, onClose }: Props) {
  useEffect(() => {
    // The credit/debit dialog closes itself on Escape first; only close here when no dialog is open.
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !document.querySelector('[role="dialog"][aria-modal="true"]:not([data-drawer])') && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-modal flex justify-end">
      <div className="fixed inset-0 bg-foreground/40 backdrop-blur-[2px]" onClick={onClose} />
      <aside role="dialog" aria-modal="true" data-drawer aria-label={`${clientName ?? 'Client'} wallet`} className="relative h-full w-full max-w-3xl bg-background border-l border-border shadow-2xl overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4 bg-background/95 backdrop-blur border-b border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Wallet statement</p>
            <h2 className="text-lg font-bold text-foreground truncate">{clientName ?? 'Client'}</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {canOpenClient && (
              <Link href={`/dashboard/clients/${clientId}?tab=wallet`} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-foreground transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />Client profile
              </Link>
            )}
            <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-5">
          <ClientWalletPanel clientId={clientId} clientName={clientName} canManage={canManage} />
        </div>
      </aside>
    </div>,
    document.body,
  );
}

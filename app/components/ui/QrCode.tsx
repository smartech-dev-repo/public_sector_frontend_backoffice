"use client";

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Skeleton } from './Skeleton';
import { cn } from '@/lib/utils';

/**
 * Draws a QR code in the browser. Used for 2FA setup: the otpauth:// link holds the admin's
 * authenticator secret, so it must never be sent to an outside QR service to be rendered.
 */
export default function QrCode({ value, alt, className }: { value: string; alt: string; className?: string }) {
 const [svg, setSvg] = useState<string | null>(null);
 const [failed, setFailed] = useState(false);

 useEffect(() => {
  let cancelled = false;
  setSvg(null);
  setFailed(false);
  QRCode.toString(value, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' })
   .then((markup) => { if (!cancelled) setSvg(markup); })
   .catch(() => { if (!cancelled) setFailed(true); });
  return () => { cancelled = true; };
 }, [value]);

 if (failed) {
  return <div className={cn('flex items-center justify-center text-xs text-muted-foreground text-center', className)}>QR code couldn&apos;t be drawn. Enter the key manually.</div>;
 }
 if (!svg) return <Skeleton className={className} />;
 // The SVG is generated locally from `value` by the qrcode library: paths only, no scripts.
 return <div role="img" aria-label={alt} className={cn('[&>svg]:w-full [&>svg]:h-full', className)} dangerouslySetInnerHTML={{ __html: svg }} />;
}

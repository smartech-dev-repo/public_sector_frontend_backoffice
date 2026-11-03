"use client";

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      visibleToasts={1}
      richColors
      closeButton
      className="!z-[999999]"
      style={{ zIndex: 999999 }}
      toastOptions={{
        className: '!z-[999999]',
        style: { zIndex: 999999 },
        classNames: {
          toast: 'border bg-background text-foreground shadow-2xl !z-[999999]',
        },
      }}
    />
  );
}

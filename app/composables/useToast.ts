"use client";

import { toast } from 'sonner';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

const recentToasts = new Map<string, number>();

export const addToast = (message: string, type: ToastType = 'success', duration = 3500) => {
  if (!message || typeof message !== 'string') return;

  const now = Date.now();
  const lastTime = recentToasts.get(message);
  // Deduplicate identical toast messages within 1.5 seconds
  if (lastTime && now - lastTime < 1500) {
    return;
  }
  recentToasts.set(message, now);

  // Clean old entries
  if (recentToasts.size > 20) {
    for (const [k, v] of recentToasts.entries()) {
      if (now - v > 5000) recentToasts.delete(k);
    }
  }

  const toastFn = (toast as any)[type] || toast;
  toastFn(message, { duration: duration || 3500 });
};

export const removeToast = (id?: any) => {
  if (id) {
    toast.dismiss(id);
  } else {
    toast.dismiss();
  }
};

export const useToast = () => {
  return {
    toasts: [] as any[],
    addToast,
    removeToast,
  };
};

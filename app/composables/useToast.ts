import { useState, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let toasts: Toast[] = [];
let toastIdCounter = 0;
const listeners = new Set<() => void>();

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

export const addToast = (message: string, type: ToastType = 'success', duration = 3000) => {
  const id = ++toastIdCounter;
  toasts = [...toasts, { id, message, type }];
  notifyListeners();
  
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
};

export const removeToast = (id: number) => {
  toasts = toasts.filter((t) => t.id !== id);
  notifyListeners();
};

export const useToast = () => {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>(toasts);

  useEffect(() => {
    const updateToasts = () => {
      setCurrentToasts(toasts);
    };
    listeners.add(updateToasts);
    return () => {
      listeners.delete(updateToasts);
    };
  }, []);

  return {
    toasts: currentToasts,
    addToast,
    removeToast
  };
};

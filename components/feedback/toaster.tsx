import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      visibleToasts={1}
      richColors
      closeButton
      style={{ zIndex: 999999 }}
      toastOptions={{
        classNames: {
          toast: 'border bg-background text-foreground',
        },
      }}
    />
  );
}

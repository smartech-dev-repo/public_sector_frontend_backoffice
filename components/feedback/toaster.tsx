import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
 return (
  <SonnerToaster
   position="top-right"
   visibleToasts={1}
   richColors
   closeButton
   className="!z-[99999]"
   toastOptions={{
    className: '!z-[99999]',
    classNames: {
     toast: 'border bg-background text-foreground shadow-lg',
    },
   }}
  />
 );
}

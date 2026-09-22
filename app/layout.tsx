import './globals.css';
import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'Admin Portal',
  description: 'Admin Portal for Public Sector',
};

import ToastContainer from '@/app/components/ui/Toast';
import { ConfirmProvider } from '@/app/composables/useConfirm';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="font-sans antialiased">
        <ConfirmProvider>
          {children}
        </ConfirmProvider>
        <ToastContainer />
      </body>
    </html>
  );
}

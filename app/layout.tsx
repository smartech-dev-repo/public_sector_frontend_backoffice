import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Portal',
  description: 'Admin Portal for Public Sector',
};

import ToastContainer from '@/app/components/ui/Toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}

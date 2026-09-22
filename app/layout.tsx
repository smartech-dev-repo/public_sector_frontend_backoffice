import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';

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
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ConfirmProvider>
            {children}
          </ConfirmProvider>
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}

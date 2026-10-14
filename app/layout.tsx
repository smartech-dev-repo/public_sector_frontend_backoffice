import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/feedback/toaster';
import { ConfirmProvider } from '@/app/composables/useConfirm';

export const metadata: Metadata = {
  title: 'Admin Portal',
  description: 'Admin Portal for Public Sector',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&f[]=satoshi@300,400,500,700,900&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ConfirmProvider>
            {children}
          </ConfirmProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/layout/navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DhanRakshak - AI-Powered Financial Planning',
  description: 'Your personal AI financial advisor and planning platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-tr from-indigo-100 via-slate-50 to-rose-100">
        <AuthProvider>
          <Navbar />
          <main className='pt-8'>
          {children}
          </main>
          <Toaster/>
        </AuthProvider>
      </body>
    </html>
  );
}
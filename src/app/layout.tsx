import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/store/demo-context';
import { PersonaSwitcherBar } from '@/components/shared/PersonaSwitcherBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Swiggy Campus Circles — Your Campus. Your Circle. Your Food.',
  description:
    'Collaborative campus group food ordering prototype for Swiggy Food for Thought 2.0. Create circles, add dishes together, split bills automatically, and eliminate delivery fees.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-[#FAFAF8] text-charcoal-900 selection:bg-swiggy-light selection:text-swiggy-orange`}
      >
        <AppProvider>
          <PersonaSwitcherBar />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}

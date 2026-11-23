import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store/demo-context';
import { PersonaSwitcherBar } from '@/components/shared/PersonaSwitcherBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

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
        className="antialiased min-h-screen flex flex-col bg-[#FAFAF8] text-charcoal-900 selection:bg-swiggy-light selection:text-swiggy-orange"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif' }}
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
